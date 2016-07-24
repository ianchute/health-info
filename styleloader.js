(() => {

  const theme = localStorage.getItem('theme') || 'spacelab'
  const head = document.head

  const cdn = document.createElement('link')
  cdn.rel = 'stylesheet'
  cdn.href = `https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/${theme}/bootstrap.min.css`
  cdn.media = 'screen'
  cdn.charset = 'utf-8'

  head.appendChild(cdn)

  const custom = document.createElement('link')
  custom.rel = 'stylesheet'
  custom.href = `themes/${theme}.css`
  custom.media = 'screen'
  custom.charset = 'utf-8'

  head.appendChild(custom)

  const site = document.createElement('link')
  site.rel = 'stylesheet'
  site.href = `style.css`
  site.media = 'screen'
  site.charset = 'utf-8'

  head.appendChild(site)

})()
