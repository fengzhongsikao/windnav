<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NLayoutHeader,
  NInput,
  NCard,
  NGrid,
  NGi,
  NTag,
  NAvatar,
  NSpin,
  NButton,
  useMessage,
} from 'naive-ui'

const DATA_URL = 'https://gist.githubusercontent.com/fengzhongsikao/3f4920464a59848a07fa8b43eb1dc014/raw/json'
const message = useMessage()

const categoryIcons: Record<string, string> = {
  '推荐网站': 'star',
  'AI产品线': 'robot',
  '个人博客': 'blog',
  '云上平台': 'cloud',
  '在线工具': 'wrench',
  '建筑网站': 'building',
  '影视在线': 'film',
  '杂项工具': 'toolbox',
  '灵感图库': 'lightbulb',
  '破解资源': 'unlock',
  '素材网站': 'images',
  '网站相关': 'globe',
  '网络存储': 'database',
}

interface SiteItem {
  n: string
  u: string
  d: string
  i: string
}

const searchQuery = ref('')
const activeCategory = ref(0)
const sectionRefs = ref<HTMLElement[]>([])
const collapsed = ref(false)
const mobileSidebarOpen = ref(false)
const isMobile = ref(false)
const loading = ref(true)
const loadError = ref(false)
const navData = ref<Record<string, SiteItem[]>>({})

const gridCols = computed(() => (isMobile.value ? 1 : 4))

const categories = computed(() => Object.keys(navData.value))

const totalSites = computed(() => {
  let count = 0
  for (const cat of categories.value) {
    count += navData.value[cat]?.length ?? 0
  }
  return count
})

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return categories.value.map((cat) => ({ name: cat, links: navData.value[cat] as SiteItem[] }))
  }
  const result: { name: string; links: SiteItem[] }[] = []
  for (const cat of categories.value) {
    const items = navData.value[cat] as SiteItem[]
    const matched = items.filter(
      (item) =>
        item.n.toLowerCase().includes(query) ||
        item.d.toLowerCase().includes(query) ||
        (item.u || '').toLowerCase().includes(query)
    )
    if (matched.length > 0) {
      result.push({ name: cat, links: matched })
    }
  }
  return result
})

function toggleCollapsed() {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    collapsed.value = !collapsed.value
  }
}

function scrollToCategory(index: number) {
  activeCategory.value = index
  mobileSidebarOpen.value = false
  const el = sectionRefs.value[index]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function setSectionRef(el: HTMLElement | null, index: number) {
  if (el) {
    sectionRefs.value[index] = el
  }
}

function openLink(url: string) {
  if (url) window.open(url, '_blank')
}

function getFaviconUrl(icon: string): string {
  if (!icon) return ''
  if (icon.startsWith('http')) return icon
  return ''
}

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

async function copyLink(e: Event, url: string) {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(url)
    message.success('链接已复制')
  } catch {
    message.error('复制失败')
  }
}

function handleResize() {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) mobileSidebarOpen.value = false
}

async function fetchNavData() {
  loading.value = true
  loadError.value = false
  try {
    const res = await fetch(DATA_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    navData.value = await res.json()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  fetchNavData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <NLayout class="app-layout">
      <!-- Top header -->
      <NLayoutHeader class="top-header" bordered>
        <div class="top-header-inner">
          <button class="hamburger-btn" @click="toggleCollapsed">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span class="top-title">风起导航</span>
          <span class="top-stats">已收录 {{ totalSites }} 个网站</span>
          <a class="github-link" href="https://github.com/fengzhongsikao/windnav" target="_blank" title="GitHub">
            <font-awesome-icon :icon="['fab', 'github']" />
          </a>
        </div>
      </NLayoutHeader>

      <NLayout has-sider class="layout-body">
        <!-- Desktop Sidebar -->
        <NLayoutSider
          v-if="!isMobile"
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="200"
          :collapsed="collapsed"
          show-trigger="arrow-circle"
          class="app-sider"
          @collapse="collapsed = true"
          @expand="collapsed = false"
        >
          <div class="sider-cats">
            <button
              v-for="(cat, idx) in categories"
              :key="cat"
              :class="['sider-cat-item', { active: activeCategory === idx }]"
              :title="collapsed ? cat : ''"
              @click="scrollToCategory(idx)"
            >
              <span class="sider-cat-icon">
                <font-awesome-icon :icon="categoryIcons[cat] || 'folder'" />
              </span>
              <transition name="fade">
                <span v-if="!collapsed" class="sider-cat-text">{{ cat }}</span>
              </transition>
              <transition name="fade">
                <NTag v-if="!collapsed" size="tiny" :bordered="false" class="sider-cat-count">
                  {{ navData[cat]?.length ?? 0 }}
                </NTag>
              </transition>
            </button>
          </div>
        </NLayoutSider>

        <!-- Content -->
        <NLayoutContent class="main-content">
          <div v-if="loading" class="loading-state">
            <NSpin size="large" />
          </div>

          <div v-else-if="loadError" class="error-state">
            <p>数据加载失败</p>
            <NButton type="primary" @click="fetchNavData">重新加载</NButton>
          </div>

          <template v-else>
          <div class="search-section">
            <NInput
              v-model:value="searchQuery"
              type="text"
              placeholder="搜索站点..."
              clearable
              round
              size="large"
              class="search-input"
            >
              <template #prefix>
                <font-awesome-icon icon="search" class="search-icon" />
              </template>
            </NInput>
          </div>

          <div v-if="filteredCategories.length === 0" class="empty-state">
            <p>未找到匹配的站点</p>
          </div>

          <div
            v-for="(cat, catIdx) in filteredCategories"
            :key="cat.name"
            class="category-section"
          >
            <div
              :ref="(el: any) => setSectionRef(el, catIdx)"
              class="category-header"
            >
              <h2 class="category-title">
                {{ cat.name }}
                <NTag size="small" :bordered="false" class="cat-count">
                  {{ cat.links.length }}
                </NTag>
              </h2>
            </div>

            <NGrid
              :cols="gridCols"
              :x-gap="12"
              :y-gap="12"
              responsive="screen"
              class="site-grid"
            >
              <NGi v-for="site in cat.links" :key="site.n + site.u" :span="1">
                <NCard hoverable class="site-card" @click="openLink(site.u)">
                  <div class="site-card-body">
                    <div class="site-icon-wrap">
                      <img
                        v-if="getFaviconUrl(site.i)"
                        :src="getFaviconUrl(site.i)"
                        class="site-icon"
                        loading="lazy"
                        decoding="async"
                        referrerpolicy="no-referrer"
                        @error="handleImgError"
                      />
                      <NAvatar v-else :size="32" round class="site-avatar">
                        {{ site.n.charAt(0) }}
                      </NAvatar>
                    </div>
                    <div class="site-info">
                      <span class="site-name">{{ site.n }}</span>
                      <span class="site-desc">{{ site.d }}</span>
                    </div>
                    <button class="copy-btn" @click="(e) => copyLink(e, site.u)" title="复制链接">
                      <font-awesome-icon icon="copy" />
                    </button>
                  </div>
                </NCard>
              </NGi>
            </NGrid>
          </div>
          </template>
        </NLayoutContent>
      </NLayout>
    </NLayout>

    <!-- Mobile overlay sidebar -->
    <div v-if="isMobile && mobileSidebarOpen" class="mobile-overlay" @click="mobileSidebarOpen = false" />
    <div v-if="isMobile" :class="['mobile-sider', { 'mobile-sider-open': mobileSidebarOpen }]">
      <div class="mobile-sider-cats">
        <button
          v-for="(cat, idx) in categories"
          :key="cat"
          :class="['mobile-cat-item', { 'mobile-cat-active': activeCategory === idx }]"
          @click="scrollToCategory(idx)"
        >
          <span class="mobile-cat-icon">
            <font-awesome-icon :icon="categoryIcons[cat] || 'folder'" />
          </span>
          <span class="mobile-cat-text">{{ cat }}</span>
          <NTag size="tiny" :bordered="false" class="mobile-cat-count">
            {{ navData[cat]?.length ?? 0 }}
          </NTag>
        </button>
      </div>
    </div>
</template>

<style>
body {
  margin: 0;
  background: #f5f7fa;
}

.app-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Top header */
.top-header {
  background: #fff !important;
  padding: 0 20px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.top-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 48px;
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #555;
  cursor: pointer;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  background: #f0f0f0;
}

.top-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
}

.top-stats {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.github-link {
  display: flex;
  align-items: center;
  color: #555;
  font-size: 20px;
  margin-left: auto;
  transition: color 0.2s;
}

.github-link:hover {
  color: #000;
}

/* Layout body */
.layout-body {
  height: calc(100vh - 49px);
}

/* Sidebar */
.app-sider {
  background: #fff;
}

.app-sider .n-layout-sider-scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sider-cats {
  padding: 8px 0;
  overflow-y: auto;
  flex: 1;
}

.sider-cat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}

.sider-cat-item:hover {
  background: #f5f7fa;
}

.sider-cat-item.active {
  background: #e8f0fe;
  color: #2080f0;
  font-weight: 500;
}

.sider-cat-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #888;
}

.sider-cat-item.active .sider-cat-icon {
  color: #2080f0;
}

.sider-cat-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
}

.sider-cat-count {
  --n-text-color: #bbb !important;
  --n-color: #f0f0f0 !important;
  flex-shrink: 0;
}

.sider-cat-item.active .sider-cat-count {
  --n-text-color: #2080f0 !important;
  --n-color: #e0eaff !important;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Content */
.main-content {
  padding: 24px 32px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: 24px;
}

.search-input {
  max-width: 520px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 18px;
  color: #999;
}

.category-section {
  margin-bottom: 8px;
}

.category-header {
  padding: 4px 0 10px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-count {
  font-size: 12px;
  --n-text-color: #999 !important;
  --n-color: #f0f0f0 !important;
}

.site-grid {
  margin-bottom: 20px;
}

.site-card {
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.site-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.site-card-body {
  display: flex;
  align-items: center;
  gap: 10px;
}

.site-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.site-avatar {
  font-size: 14px;
  font-weight: 600;
}

.site-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.site-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: #f0f0f0;
  color: #2080f0;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #999;
  font-size: 16px;
}

.loading-state {
  text-align: center;
  padding: 120px 0;
}

.error-state {
  text-align: center;
  padding: 80px 0;
  color: #e74c3c;
  font-size: 16px;
}

/* Mobile */
@media (max-width: 767px) {
  .top-header {
    padding: 0 12px;
  }

  .top-stats {
    display: none;
  }

  .main-content {
    padding: 12px 14px;
  }

  .search-input {
    max-width: 100%;
  }

  .category-title {
    font-size: 15px;
  }

  .site-card-body {
    gap: 8px;
  }

  .site-name {
    font-size: 13px;
  }

  .site-desc {
    font-size: 11px;
  }
}

/* Mobile overlay sider */
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.3);
}

.mobile-sider {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  z-index: 35;
  background: #fff;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
}

.mobile-sider-open {
  transform: translateX(0);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
}

.mobile-sider-cats {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.mobile-cat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}

.mobile-cat-item:hover,
.mobile-cat-item:active {
  background: #f5f7fa;
}

.mobile-cat-active {
  background: #e8f0fe;
  color: #2080f0;
  font-weight: 500;
}

.mobile-cat-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #888;
}

.mobile-cat-active .mobile-cat-icon {
  color: #2080f0;
}

.mobile-cat-text {
  flex: 1;
  white-space: normal;
  overflow: visible;
}

.mobile-cat-count {
  --n-text-color: #bbb !important;
  --n-color: #f0f0f0 !important;
  flex-shrink: 0;
}

.mobile-cat-active .mobile-cat-count {
  --n-text-color: #2080f0 !important;
  --n-color: #e0eaff !important;
}
</style>
