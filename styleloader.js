(window.loadStyles = () => {

  const theme = localStorage.getItem('theme') || 'spacelab'
  const head = document.head

  const existingCdn = document.getElementById('style-cdn')
  if (existingCdn) head.removeChild(existingCdn)
  const existingCustom = document.getElementById('style-custom')
  if (existingCustom) head.removeChild(existingCustom)
  const existingSite = document.getElementById('style-site')
  if (existingSite) head.removeChild(existingSite)

  const cdn = document.createElement('link')
  cdn.id = 'style-cdn'
  cdn.rel = 'stylesheet'
  cdn.href = `https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/${theme}/bootstrap.min.css`
  cdn.media = 'screen'
  cdn.charset = 'utf-8'

  head.appendChild(cdn)

  const custom = document.createElement('link')
  custom.id = 'style-custom'
  custom.rel = 'stylesheet'
  custom.href = `themes/${theme}.css`
  custom.media = 'screen'
  custom.charset = 'utf-8'

  head.appendChild(custom)

  const site = document.createElement('link')
  site.id = 'style-site'
  site.rel = 'stylesheet'
  site.href = `style.css`
  site.media = 'screen'
  site.charset = 'utf-8'

  head.appendChild(site)

})()
