/*
 * JavaScript Load Image Demo JS
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global loadImage, HTMLCanvasElement, $ */
function convert(DMS){
  splitDMS = DMS.split(",");
  D = Number(splitDMS[0]);
  M = Number(splitDMS[1]);
  S = Number(splitDMS[2]);
  var DD;
  D < 0 ? DD = roundOff(D + (M/-60) + (S/-3600),6) : DD = roundOff(D + (M/60) + (S/3600),6);
  return DD;
}
function roundOff(num,decimalplaces){
  var decimalfactor = Math.pow(10,decimalplaces);
  var roundedValue = Math.round(num*decimalfactor)/decimalfactor;
  return roundedValue;
}
// function toDecimal(f){
//   var LatDegrees = parseInt(f.LatDegrees.value);
//   var LatMinutes = parseInt(f.LatMinutes.value);
//   var LatSeconds = parseInt(f.LatSeconds.value);
//   var LonDegrees = parseInt(f.LonDegrees.value);
//   var LonMinutes = parseInt(f.LonMinutes.value);
//   var LonSeconds = parseInt(f.LonSeconds.value);

//   var LatDecimalDegrees = convert(LatDegrees,LatMinutes,LatSeconds);
//   var LonDecimalDegrees = convert(LonDegrees,LonMinutes,LonSeconds);

//   !isNaN(LatDecimalDegrees) && !(LatDecimalDegrees > 90) && !(LatDecimalDegrees < -90) ? f.LatDecimalDegrees.value = LatDecimalDegrees : f.LatDecimalDegrees.value = "";
//   !isNaN(LonDecimalDegrees) && !(LonDecimalDegrees > 180) && !(LonDecimalDegrees < -180)  ? f.LonDecimalDegrees.value = LonDecimalDegrees : f.LonDecimalDegrees.value = "";
// }
// 사용할 앱의 JavaScript 키를 설정해 주세요.
Kakao.init('ae5774f9189404a1128dc1e630862dfa');
// 카카오 로그인 버튼을 생성합니다.
function navi(){
  Kakao.Navi.start({
      name: "현대백화점 판교점",
      x: Number(convert(String(lat))),
      y: Number(convert(String(lag))),
      coordType: 'wgs84'
  });
}

$(function () {
  'use strict'

  var result = $('#result')
  var exifNode = $('#exif')
  var thumbNode = $('#thumbnail')
  var actionsNode = $('#actions')
  var currentFile
  var coordinates

  function displayExifData (exif) {
    var thumbnail = exif.get('Thumbnail')
    var tags = exif.getAll()
    var lat = tags["GPSLatitude"];
    var lag = tags["GPSLongitude"];

    var table = exifNode.find('table').empty()
    var row = $('<tr></tr>')
    var cell = $('<td></td>')
    var prop
    if (thumbnail) {
      thumbNode.empty()
      loadImage(thumbnail, function (img) {
        thumbNode.append(img).show()
      }, {orientation: exif.get('Orientation')})
    }
    
    table.append(
      row.clone()
        .append(cell.clone().text("GPSLatitude"))
        .append(
          cell.clone().text(
            convert(String(lat))
          )
        )
    )
    table.append(
      row.clone()
        .append(cell.clone().text("GPSLongitude"))
        .append(
          cell.clone().text(
            convert(String(lag))
          )
        )
    )
    // for (prop in tags) {
    //   if (tags.hasOwnProperty(prop)) {
    //     table.append(
    //       row.clone()
    //         .append(cell.clone().text(prop))
    //         .append(cell.clone().text(tags[prop]))
    //         //0x0002 , 0x0004
    //     )
    //   }
    // }
    exifNode.show()
  }
  
  function updateResults (img, data) {
    var fileName = currentFile.name
    var href = img.src
    var dataURLStart
    var content
    if (!(img.src || img instanceof HTMLCanvasElement)) {
      content = $('<span>Loading image file failed</span>')
    } else {
      if (!href) {
        href = img.toDataURL(currentFile.type + 'REMOVEME')
        // Check if file type is supported for the dataURL export:
        dataURLStart = 'data:' + currentFile.type
        if (href.slice(0, dataURLStart.length) !== dataURLStart) {
          fileName = fileName.replace(/\.\w+$/, '.png')
        }
      }
      content = $('<a target="_blank">').append(img)
        .attr('download', fileName)
        .attr('href', href)
    }
    result.children().replaceWith(content)
    if (img.getContext) {
      actionsNode.show()
    }
    if (data && data.exif) {
      displayExifData(data.exif)
    }
  }

  function displayImage (file, options) {
    currentFile = file
    if (!loadImage(
      file,
      updateResults,
      options
    )) {
      result.children().replaceWith(
        $('<span>' +
          'Your browser does not support the URL or FileReader API.' +
          '</span>')
      )
    }
  }

  function dropChangeHandler (e) {
    e.preventDefault()
    e = e.originalEvent
    var target = e.dataTransfer || e.target
    var file = target && target.files && target.files[0]
    var options = {
      maxWidth: result.width(),
      canvas: true,
      pixelRatio: window.devicePixelRatio,
      downsamplingRatio: 0.5,
      orientation: true
    }
    if (!file) {
      return
    }
    exifNode.hide()
    thumbNode.hide()
    displayImage(file, options)
  }

  // Hide URL/FileReader API requirement message in capable browsers:
  if (window.createObjectURL || window.URL || window.webkitURL ||
      window.FileReader) {
    result.children().hide()
  }

  $(document)
    .on('dragover', function (e) {
      e.preventDefault()
      e = e.originalEvent
      e.dataTransfer.dropEffect = 'copy'
    })
    .on('drop', dropChangeHandler)

  $('#file-input')
    .on('change', dropChangeHandler)

  $('#edit')
    .on('click', function (event) {
      event.preventDefault()
      var imgNode = result.find('img, canvas')
      var img = imgNode[0]
      var pixelRatio = window.devicePixelRatio || 1
      imgNode.Jcrop({
        setSelect: [
          40,
          40,
          (img.width / pixelRatio) - 40,
          (img.height / pixelRatio) - 40
        ],
        onSelect: function (coords) {
          coordinates = coords
        },
        onRelease: function () {
          coordinates = null
        }
      }).parent().on('click', function (event) {
        event.preventDefault()
      })
    })

  $('#crop')
    .on('click', function (event) {
      event.preventDefault()
      var img = result.find('img, canvas')[0]
      var pixelRatio = window.devicePixelRatio || 1
      if (img && coordinates) {
        updateResults(loadImage.scale(img, {
          left: coordinates.x * pixelRatio,
          top: coordinates.y * pixelRatio,
          sourceWidth: coordinates.w * pixelRatio,
          sourceHeight: coordinates.h * pixelRatio,
          minWidth: result.width(),
          maxWidth: result.width(),
          pixelRatio: pixelRatio,
          downsamplingRatio: 0.5
        }))
        coordinates = null
      }
    })
})
