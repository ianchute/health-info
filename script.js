$(document).ready(() => {

  'use strict'

  $('[data-toggle="tooltip"]').tooltip({
    container: 'body'
  })
  $('body').fadeIn()

  const $categoryListContainer = $('.categoryListContainer')

  const $categoryList = $('.categoryList')
  const categoryListItems = []

  const $subCategoryList = $('.subCategoryList')
  const subCategoryListItems = []

  const $itemList = $('.itemList')
  const itemListItems = []

  const $mapContainer = $('.mapContainer').fadeOut()
  const $tableContainer = $('.tableContainer').fadeOut()
  const $loading = $('.loading')
  const $yearSelect = $('.year')
  const $countrySelect = $('.country')
  const $emptyState = $('.emptyState').fadeOut()
  const $pathLabel = $('.pathLabel')
  const $resetLabel = $('.resetLabel')
  const $select = $('#select')

  const years = Array.apply(0, Array(57)).map((x, i) => `<option value="${2015 - i}">${2015 - i}</option>`)
  $yearSelect.html(years.join(''))
  $yearSelect.val('2014')

  $.ajax('config.json').then(config => {

    const countryCodes = countries.map(country => country['alpha-3'])
    const countryNames = Object.assign.apply(Object, countries.filter(country => country['alpha-3'] !== 'UMI').map(
      country => ({
        [country['alpha-3']]:
          (country['name'])
          .replace(/\(.*\)/g, '')
          .replace(/\sand.*/g, '')
          .replace(/\,.*/g, '')
          .replace(/of\s.*/g, '')
      })
    ))
    const palette = config.palette
    const mainCategoryMap = config.mainCategoryMap
    const subCategoryMap = config.subCategoryMap
    let categories
    let items
    let mainCategories
    let subCategories

    const root = new Firebase(config.firebase.url)

    root.authWithCustomToken(config.firebase.secret, (error, authData) => {
      if (error) alert('Unable to authenticate!')

      $countrySelect.html(
        Object.keys(countryNames).map(key => `<option value="${key}">${countryNames[key]}</option>`).join('')
      )

      root.child('categories').once('value', snap => {

        categories = snap.val()
        items = Object.keys(categories)
        mainCategories = [...groupBy(items, k => k.split('_')[0]).keys()]
        subCategories = [...groupBy(items, k => k.split('_')[0] + '_' + k.split('_')[1]).keys()]

        mainCategories
          .sort((a, b) => mainCategoryMap[a].localeCompare(mainCategoryMap[b]))
          .map(k => categoryListItems.push(`
            <a href="#"
              class="list-group-item categoryListItem"
              data-id="${k}" data-kind="category"
            >${mainCategoryMap[k]}</a>
          `))
        $categoryList.empty().html(categoryListItems.join(''))

        const handler = (eList => {
          if ($('.list-group-item').hasClass('disabled') || $(eList.target).hasClass('active')) return;

          const $target = $(eList.target)
          const kind = $target.data('kind')
          const id = $target.data('id')

          if (kind === 'category') {

            $('.list-group-item').off()
            subCategoryListItems.length = 0
            subCategories
              .filter(categoryKey => categoryKey.startsWith(id + '_'))
              .map(categoryKey => subCategoryListItems.push(`
                <a href="#"
                  class="list-group-item subCategoryListItem"
                  data-id="${categoryKey}" data-kind="subCategory"
                >${subCategoryMap[categoryKey.split('_')[1]]}</a>
              `))
            $pathLabel.append(`<span>${$target.text()}</span>`)
            $categoryList.fadeOut(() => {
              $subCategoryList.empty().html(subCategoryListItems.join(''))
              $('.list-group-item').click(handler)
              $subCategoryList.fadeIn()
            })

          } else if (kind === 'subCategory') {

            $('.list-group-item').off()
            itemListItems.length = 0
            items
              .filter(categoryKey => categoryKey.startsWith(id + '_'))
              .map(categoryKey => itemListItems.push(`
                <a href="#"
                  class="list-group-item itemListItem"
                  data-id="${categoryKey}" data-kind="item"
                >${categories[categoryKey]}</a>
              `))
            $pathLabel.append(`<span>${$target.text()}</span>`)
            $subCategoryList.fadeOut(() => {
              $itemList.empty().html(itemListItems.join(''))
              $('.list-group-item').click(handler)
              $itemList.fadeIn()
            })

          } else if (kind === 'item') {
            itemHandler($(eList.target))
          }
        })

        const itemHandler = (target => {

          $('[data-toggle="tooltip"]').tooltip('hide')

          target = typeof target === 'undefined' ? $('a.active') : target
          if (!target.length) return
          $('.list-group-item').off()
          $('a').attr('disabled', true).addClass('disabled').removeClass('active')
          $(target).addClass('active')

          $emptyState.fadeOut(() => {
            $mapContainer.fadeOut(() => {
              $yearSelect.attr('disabled', true).addClass('disabled')
              $resetLabel.attr('disabled', true).addClass('disabled')
              $pathLabel.attr('disabled', true).addClass('disabled')
              $loading.fadeIn()
              $('.list-group-item').click(handler)
              root.child('data').child($('a.active').data('id')).once('value', snap => {

                $('svg').empty()
                $('table').empty()
                $loading.fadeOut(() => $mapContainer.fadeIn(() => {
                  $yearSelect.removeAttr('disabled').removeClass('disabled')
                  $resetLabel.removeAttr('disabled').removeClass('disabled')
                  $pathLabel.removeAttr('disabled').removeClass('disabled')
                  $('a').removeAttr('disabled').removeClass('disabled')
                  const selectedData = snap.val()
                  const mappedData =
                    Object.keys(selectedData)
                    .filter(country => countryCodes.indexOf(country) !== -1)
                    .map(country =>
                      Object.assign(

                        Object.assign.apply(Object,
                          Object.keys(selectedData[country])
                          .map(k => ({
                            [k]: (selectedData[country][k]).toFixed(0)
                          }))
                        ),

                        {
                          'country': country
                        }
                      )
                    )

                  const yearSelected = $yearSelect.val()
                  const worldMap = d3.geomap.choropleth()
                    .geofile('topojson/world/countries.json')
                    .colors(palette)
                    .column(yearSelected)
                    .legend(true)
                    .unitId('country')

                  $('.mapLabel').text($('a.active').text() + ` (${yearSelected})`)

                  d3.select('svg').datum(mappedData).call(worldMap.draw, worldMap)

                  setTimeout(() => $('.legend-bg').attr('rx', '4'), 500)
                }))

              }, (e => {
                alert('An error has occurred. The page will now refresh')
                location.reload()
              }))
            })
          })
        })

        const select = (() => {

          $('[data-toggle="tooltip"]').tooltip('hide')

          $emptyState.fadeOut(() => {
            $mapContainer.fadeOut(() => {
              $select.attr('disabled', true).addClass('disabled')
              $countrySelect.attr('disabled', true).addClass('disabled')
              $loading.fadeIn()

              const country1 = $($countrySelect[0]).val()
              const country2 = $($countrySelect[1]).val()

              const country1Promises =
                Object.keys(categories).map(categoryKey => root.child('data').child(categoryKey).child(country1).child($yearSelect.val()).once('value'))
              const country2Promises =
                Object.keys(categories).map(categoryKey => root.child('data').child(categoryKey).child(country2).child($yearSelect.val()).once('value'))

              Promise.all(country2Promises.concat(country1Promises)).then(function () {

                const args = ([...arguments][0])

                const tableData = args
                .sort((snapA, snapB) => {
                  const areEqual = snapA.ref().toString().split('/').splice(-3)[0] === snapB.ref().toString().split('/').splice(-3)[0]
                  const differentiator = snapB.ref().toString().split('/').splice(-2)[0].trim() === country1 ? 'A' : 'Z'
                  const comparison = (snapA.ref().toString().split('/').splice(-3)[0].padRight(40, '_') + (areEqual ? differentiator : '')).trim()
                    .localeCompare((snapB.ref().toString().split('/').splice(-3)[0].padRight(40, '_') + (areEqual ? differentiator: '')).trim())
                  return comparison
                })
                .map(snap => {
                  const country = snap.ref().toString().split('/').splice(-2)[0]
                  const statistic = categories[snap.ref().toString().split('/').splice(-3)[0]]
                  const value = snap.val()

                  if (country === country1)
                    return `<tr><td>${statistic}</td><td>${value.toLocaleString()}</td>`
                  else if (country === country2)
                    return `<td>${value.toLocaleString()}</td></tr>`
                }).join('')

                console.log(tableData)

                $('svg').empty()
                $('table').empty().html('<thead></thead><tbody></tbody>')
                $('table > thead').html(`<tr><td>Statistic</td><td>${countryNames[country1]}</td><td>${countryNames[country2]}</td></tr>`)
                $('table > tbody').html(tableData)
                $loading.fadeOut(() => $tableContainer.fadeIn(() => {
                  $select.removeAttr('disabled').removeClass('disabled')
                  $countrySelect.removeAttr('disabled').removeClass('disabled')
                }))
              })
            })
          })
        })

        const reset = (() => {

          $('a').removeClass('active')
          $mapContainer.fadeOut()
          $('.list-group').fadeOut(() => {
            $loading.fadeOut(
              () => $categoryList.parent().fadeIn(
                () => {
                  $yearSelect.prev().fadeIn()
                  $yearSelect.fadeIn()
                  $countrySelect.prev().fadeIn()
                  $countrySelect.fadeIn()
                  $pathLabel.empty().html('<span>Health Info</span>').fadeIn()
                  $resetLabel.fadeIn().off().click(reset)
                  $categoryList.fadeIn()
                  $emptyState.fadeIn()
                  $($countrySelect[0]).val('USA')
                  $($countrySelect[1]).val('PHL')
                  $select.fadeIn()
                  $('.list-group-item').off().click(handler)
                  $yearSelect.off().change(() => itemHandler())
                  $select.off().click(() => select())
                }
              )
            )
          })
        })

        reset()
      }, (e => {
        alert('An error has occurred. The page will now refresh')
        location.reload()
      }))

    })
  })

})
