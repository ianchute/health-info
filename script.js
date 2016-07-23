$(() => {

  const $categoryList = $('.categoryList')
  const $categoryListContainer = $('.categoryListContainer')
  const $mapContainer = $('.mapContainer').fadeOut()
  const $loading = $('.loading')
  const $yearSelect = $('#year')
  const $emptyState = $('.emptyState').fadeOut()
  const categoryListItems = []
  const countryCodes = countries.map(country => country['alpha-3'])
  let categories

  const years = Array.apply(0, Array(57)).map((x, i) => `<option value="${2015 - i}">${2015 - i}</option>`)
  $yearSelect.html(years.join(''))
  $yearSelect.val('2014')

  $.ajax('config.json').then(config => {

    const root = new Firebase(config.firebase.url)

    root.authWithCustomToken(config.firebase.secret, (error, authData) => {
      if (error) alert('Unable to authenticate!')

      root.child('categories').once('value', snap => {

        categories = snap.val()
        Object.keys(categories)
          .sort((a, b) => categories[a].localeCompare(categories[b]))
          .map(categoryKey => categoryListItems.push(`
              <a href="#"
                class="list-group-item categoryListItem"
                data-id="${categoryKey}"
              >${categories[categoryKey]}</a>
            `))

        $loading.fadeOut(
          () => $categoryList.empty().html(categoryListItems.join('')).parent().fadeIn(
            () =>
            {
              $emptyState.fadeIn()
              $('.categoryListItem').click(eList => {
                if ($('.categoryListItem').hasClass('disabled')) return;

                $yearSelect.addClass('disabled')
                $('.categoryListItem').addClass('disabled').removeClass('active')
                $(eList.target).addClass('active')
                $emptyState.fadeOut(() =>
                  $mapContainer.fadeOut(() => $loading.fadeIn())
                )

                const id = $(eList.target).data('id')
                root.child('data').child(id).once('value', snap => {
                  $('svg').empty()
                  $loading.fadeOut(() => $mapContainer.fadeIn(() => {
                    $yearSelect.removeClass('disabled')
                    $('.categoryListItem').removeClass('disabled')
                    const selectedData = snap.val()
                    const mappedData =
                      Object.keys(selectedData)
                        .filter(country => countryCodes.indexOf(country) !== -1)
                        .map(country =>
                          Object.assign(

                            Object.assign.apply(Object,
                              Object.keys(selectedData[country])
                              .map(k => ({[k]: selectedData[country][k].toString()}))
                            ),

                            {
                              'country': country
                            }
                          )
                        )

                    const yearSelected = $yearSelect.val()
                    const worldMap = d3.geomap.choropleth()
                      .geofile('topojson/world/countries.json')
                      .colors(['#ffeda0', '#feb24c', '#f03b20'])
                      .column(yearSelected)
                      .legend(true)
                      .unitId('country')

                      $('.mapLabel').text($(eList.target).text() + ` (${yearSelected})` )

                    d3.select('svg').datum(mappedData).call(worldMap.draw, worldMap)
                  }))
                })
              })
            }

          )
        )

      })

    })
  })

})
