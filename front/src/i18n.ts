import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhLayout from './locales/zh-CN/layout.json'
import zhCommon from './locales/zh-CN/common.json'
import zhSettings from './locales/zh-CN/settings.json'
import zhNotFound from './locales/zh-CN/notFound.json'
import enLayout from './locales/en-US/layout.json'
import enCommon from './locales/en-US/common.json'
import enSettings from './locales/en-US/settings.json'
import enNotFound from './locales/en-US/notFound.json'
import enUi from './locales/en-US/ui.json'
import viLayout from './locales/vi-VN/layout.json'
import viCommon from './locales/vi-VN/common.json'
import viSettings from './locales/vi-VN/settings.json'
import viNotFound from './locales/vi-VN/notFound.json'
import viUi from './locales/vi-VN/ui.json'

export type SupportedLanguage = 'zh-CN' | 'en-US' | 'vi-VN'

const resources = {
  'zh-CN': {
    common: zhCommon,
    layout: zhLayout,
    settings: zhSettings,
    notFound: zhNotFound,
  },
  'en-US': {
    common: enCommon,
    layout: enLayout,
    settings: enSettings,
    notFound: enNotFound,
    ui: enUi,
  },
  'vi-VN': {
    common: viCommon,
    layout: viLayout,
    settings: viSettings,
    notFound: viNotFound,
    ui: viUi,
  },
}

function storedLanguage(): SupportedLanguage {
  try {
    const language = localStorage.getItem('jellyfish_language')
    return language === 'en-US' || language === 'vi-VN' ? language : 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

i18n.on('languageChanged', language => {
  const effectiveLanguage: SupportedLanguage = language === 'en-US' || language === 'vi-VN' ? language : 'zh-CN'
  try { localStorage.setItem('jellyfish_language', effectiveLanguage) } catch { /* Storage may be unavailable. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = effectiveLanguage
})

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en-US', 'vi-VN'],
    ns: ['common', 'layout', 'settings', 'notFound', 'ui'],
    defaultNS: 'layout',
    interpolation: {
      escapeValue: false,
    },
    lng: storedLanguage(),
  })

export function currentLanguage(): SupportedLanguage {
  return i18n.resolvedLanguage === 'en-US' || i18n.resolvedLanguage === 'vi-VN' ? i18n.resolvedLanguage : 'zh-CN'
}

export default i18n

