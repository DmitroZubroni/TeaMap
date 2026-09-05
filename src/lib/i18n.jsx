import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getStoredLocale, setStoredLocale } from './locale'

// Здесь переводится только «обвязка» интерфейса (подписи, кнопки,
// заголовки разделов, сообщения). Сама база чаёв (названия, описания,
// история, названия регионов/стран) остаётся как есть в исходных данных —
// перевод самого контента это отдельная и намного бо́льшая задача, в этот
// переключатель языка она не входит.
const STRINGS = {
  ru: {
    metaTitle: 'Атлас чая — Интерактивная карта чайных регионов и сортов мира',
    metaDescription:
      'Интерактивный атлас чайных терруаров, регионов и сортов мира: происхождение (origins), высоты гор (elevations), культивары (cultivars) и заваривание (gongfu brewing) чаёв Китая, Японии, Индии и других стран.',
    appTitle: '茶 · Атлас чая',
    appTagline: 'карта чайных регионов',
    tabNav: 'Навигация',
    tabReference: 'Справочник',
    tabFavorites: 'Избранное',
    noFavorites: 'Пока пусто — добавляйте чаи через сердечко на карточке.',
    addFavorite: 'Добавить в избранное',
    removeFavorite: 'Убрать из избранного',
    home: 'Мир',
    countries: 'страны',
    soon: 'скоро',
    regionsHintClick: 'клик покажет чаи региона',
    allRegions: '← Все регионы',
    allCountries: '← Все страны',
    teaHintClick: 'клик открывает карточку',
    noTeasInRegion: 'Чаи этого региона пока не добавлены.',
    legendTitle: 'цвет точки = цвет настоя',
    filterTitle: 'фильтр по категориям · клик скрывает точки на карте',
    filterAll: 'Показать все',
    filterNone: 'Скрыть все',
    allTeasSearch: 'все чаи · поиск по всем странам',
    searchPlaceholder: 'Название или регион…',
    nothingFound: 'Ничего не найдено.',
    openMenu: 'Открыть меню',
    collapseMenu: 'Свернуть меню',
    teaCountLine: (teas, regions) => `${teas} точек чая · ${regions} регионов`,
    tabOverview: 'Обзор',
    tabHistory: 'История',
    closeCard: 'Закрыть карточку',
    loadingCard: 'Загружаю карточку…',
    cultivar: 'Культивар',
    oxidation: 'Ферментация',
    roast: 'Прожарка',
    harvest: 'Сбор',
    water: 'Вода',
    steeps: 'Проливы',
    leafWeight: 'Навеска',
    teaware: 'Посуда',
    about: 'О чае',
    dryLeaf: 'Сухой лист',
    liquor: 'Настой',
    aroma: 'Аромат',
    taste: 'Вкус',
    aftertaste: 'Послевкусие',
    processing: 'Технология',
    origin: 'Происхождение',
    history: 'История',
    modernDay: 'Сегодня',
    facts: 'Любопытные факты',
    noHistory: 'Историческая справка пока не заполнена.',
    mapLoading: 'Загружаю карту…',
    mapLoadError: 'Карта не загрузилась',
    mapLoadErrorSlow: 'Карта долго не отвечает. Проверьте соединение и обновите страницу.',
    mapLoadErrorGeneric: 'Не удалось загрузить карту. Проверьте соединение и обновите страницу.',
    countrySoonToast: (name) => `${name} — данные скоро появятся`,
    thisCountry: 'Эта страна',
    donateBtn: 'Угостить чаем',
    donateBadge: 'Поддержка проекта',
    donateTitle: 'TeaMap — открытый атлас чая',
    donateDesc:
      'Атлас развивается открыто, бесплатно и без рекламы. Если проект помог вам погрузиться в чайную географию, открыть для себя новые сорта или найти любимый чай — вы можете поддержать автора пиалой хорошего чая!',
    donateCtaLabel: 'Отправить чаевые через CloudTips',
    donateCtaSub: 'СБП · T-Pay · СберPay · Карты любого банка',
    donateSecure: 'Безопасная оплата через Т-Банк. Ваши личные данные не передаются.',
    close: 'Закрыть',
  },
  en: {
    metaTitle: 'Tea Atlas — Interactive World Map of Tea Terroirs & Cultivars',
    metaDescription:
      'Interactive world map of tea terroirs, origins, and mountain elevations. Explore authentic cultivars, tasting profiles, and gongfu brewing guides across China, Japan, India, and beyond.',
    appTitle: '茶 · Tea Atlas',
    appTagline: 'map of tea-growing regions',
    tabNav: 'Navigate',
    tabReference: 'Reference',
    tabFavorites: 'Favorites',
    noFavorites: 'Nothing here yet — tap the heart on a tea card to add one.',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    home: 'World',
    countries: 'countries',
    soon: 'soon',
    regionsHintClick: 'click to see the region\u2019s teas',
    allRegions: '← All regions',
    allCountries: '← All countries',
    teaHintClick: 'click to open the card',
    noTeasInRegion: 'No teas added for this region yet.',
    legendTitle: 'dot color = liquor color',
    filterTitle: 'filter by category · click to hide dots on the map',
    filterAll: 'Show all',
    filterNone: 'Hide all',
    allTeasSearch: 'all teas · search across every country',
    searchPlaceholder: 'Name or region…',
    nothingFound: 'Nothing found.',
    openMenu: 'Open menu',
    collapseMenu: 'Collapse menu',
    teaCountLine: (teas, regions) => `${teas} teas · ${regions} regions`,
    tabOverview: 'Overview',
    tabHistory: 'History',
    closeCard: 'Close card',
    loadingCard: 'Loading card…',
    cultivar: 'Cultivar',
    oxidation: 'Oxidation',
    roast: 'Roast',
    harvest: 'Harvest',
    water: 'Water',
    steeps: 'Steeps',
    leafWeight: 'Leaf weight',
    teaware: 'Teaware',
    about: 'About',
    dryLeaf: 'Dry leaf',
    liquor: 'Liquor',
    aroma: 'Aroma',
    taste: 'Taste',
    aftertaste: 'Aftertaste',
    processing: 'Processing',
    origin: 'Origin',
    history: 'History',
    modernDay: 'Today',
    facts: 'Interesting facts',
    noHistory: 'No historical notes yet.',
    mapLoading: 'Loading map…',
    mapLoadError: 'The map failed to load',
    mapLoadErrorSlow: 'The map is taking a while. Check your connection and reload the page.',
    mapLoadErrorGeneric: 'Could not load the map. Check your connection and reload the page.',
    countrySoonToast: (name) => `${name} — data coming soon`,
    thisCountry: 'This country',
    donateBtn: 'Buy a bowl of tea',
    donateBadge: 'Project Support',
    donateTitle: 'TeaMap — Open Tea Atlas',
    donateDesc:
      'The atlas is developed openly, freely, and without ads. If the project helped you explore tea geography, discover new terroirs, or find a favorite tea — you can support the author with a bowl of good tea!',
    donateCtaLabel: 'Send a tip via CloudTips',
    donateCtaSub: 'SBP · T-Pay · SberPay · Any bank card',
    donateSecure: 'Secure payment powered by T-Bank. Your personal data is not shared.',
    close: 'Close',
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  // Язык интерфейса и язык данных теперь один и тот же переключатель:
  // читаем сохранённый выбор при загрузке (по умолчанию — английский).
  const [locale] = useState(getStoredLocale)

  useEffect(() => {
    const dict = STRINGS[locale] || STRINGS.en
    document.title = dict.metaTitle || dict.appTitle
    document.documentElement.lang = locale

    if (dict.metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) metaDesc.setAttribute('content', dict.metaDescription)
      const ogDesc = document.querySelector('meta[property="og:description"]')
      if (ogDesc) ogDesc.setAttribute('content', dict.metaDescription)
      const twDesc = document.querySelector('meta[name="twitter:description"]')
      if (twDesc) twDesc.setAttribute('content', dict.metaDescription)
    }
    if (dict.metaTitle) {
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) ogTitle.setAttribute('content', dict.metaTitle)
      const twTitle = document.querySelector('meta[name="twitter:title"]')
      if (twTitle) twTitle.setAttribute('content', dict.metaTitle)
    }
  }, [locale])

  // api.js читает локаль один раз при загрузке модуля (чтобы не тащить
  // повсюду реактивную зависимость по всему дереву запросов), поэтому смена
  // языка данных требует перезагрузки страницы. Это не страшно: адрес уже
  // содержит текущую страну/регион/чай (см. App.jsx), так что после
  // перезагрузки приложение само долетит обратно туда же, просто на другом
  // языке.
  const setLocale = (next) => {
    if (next === locale) return
    setStoredLocale(next)
    window.location.reload()
  }

  const value = useMemo(() => {
    const dict = STRINGS[locale] || STRINGS.en
    const t = (key, ...args) => {
      const entry = dict[key] ?? STRINGS.en[key] ?? key
      return typeof entry === 'function' ? entry(...args) : entry
    }
    return { locale, setLocale, t }
  }, [locale]) // eslint-disable-line react-hooks/exhaustive-deps

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
