import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Здесь переводится только «обвязка» интерфейса (подписи, кнопки,
// заголовки разделов, сообщения). Сама база чаёв (названия, описания,
// история, названия регионов/стран) остаётся как есть в исходных данных —
// перевод самого контента это отдельная и намного бо́льшая задача, в этот
// переключатель языка она не входит.
const STRINGS = {
  ru: {
    appTitle: '茶 · Атлас чая',
    appTagline: 'карта чайных регионов',
    tabNav: 'Навигация',
    tabReference: 'Справочник',
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
  },
  en: {
    appTitle: '茶 · Tea Atlas',
    appTagline: 'map of tea-growing regions',
    tabNav: 'Navigate',
    tabReference: 'Reference',
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
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  // По умолчанию английский, переключается на русский в интерфейсе.
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const dict = STRINGS[locale] || STRINGS.en
    document.title = dict.appTitle
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => {
    const dict = STRINGS[locale] || STRINGS.en
    const t = (key, ...args) => {
      const entry = dict[key] ?? STRINGS.en[key] ?? key
      return typeof entry === 'function' ? entry(...args) : entry
    }
    return { locale, setLocale, t }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
