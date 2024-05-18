import React, { useEffect } from 'react';
// import './kakaomaplist.css';
// import $ from 'jquery';

const KakaoMap = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey={api_key집어넣으세요}&libraries=services";
    script.async = true;
    script.onload = () => {
      const kakao = window.kakao;

      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locPosition = new kakao.maps.LatLng(lat, lon);
          const message = '<div style="padding:5px;">현재 당신의 위치!</div>';

          displayMarker_me(locPosition, message);

          const ps = new kakao.maps.services.Places();

          ps.keywordSearch('서점', (data, status, pagination) => placesSearchCB(data, status, pagination, 'bookshop.png'), {
            location: new kakao.maps.LatLng(lat, lon),
            radius: 10000,
            sort: kakao.maps.services.SortBy.DISTANCE,
          });

          ps.keywordSearch('도서관', (data, status, pagination) => placesSearchCB(data, status, pagination, 'library.png'), {
            location: new kakao.maps.LatLng(lat, lon),
            radius: 10000,
            sort: kakao.maps.services.SortBy.DISTANCE,
          });
        });
      } else {
        const locPosition = new kakao.maps.LatLng(33.450701, 126.570667);
        const message = 'geolocation을 사용할수 없어요..';
        displayMarker_me(locPosition, message);
      }

      function displayMarker_me(locPosition, message) {
        const imageSrc = './now.png';
        const imageSize = new kakao.maps.Size(50);
        const imageOption = { offset: new kakao.maps.Point(27, 69) };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        const marker_me = new kakao.maps.Marker({
          map: map,
          position: locPosition,
          image: markerImage
        });

        const infowindow_me = new kakao.maps.InfoWindow({
          content: message,
          removable: true
        });
        infowindow_me.open(map, marker_me);
        map.setCenter(locPosition);
      }

      function placesSearchCB(data, status, pagination, imageSrc) {
        if (status === kakao.maps.services.Status.OK) {
          displayPlaces(data, imageSrc);
          displayPagination(pagination);
          const bounds = new kakao.maps.LatLngBounds();
          for (let i = 0; i < data.length; i++) {
            displayMarker(data[i], imageSrc);
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
          }
          map.setBounds(bounds);
        }
      }

      const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

      function displayMarker(place, imageSrc) {
        const imageSize = new kakao.maps.Size(30);
        const imageOption = { offset: new kakao.maps.Point(27, 69) };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        const marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(place.y, place.x),
          image: markerImage
        });

        kakao.maps.event.addListener(marker, 'mouseover', () => {
          infowindow.setContent(`<div style="width:150px;padding:3px;font-size:10px;">${place.place_name}</div>`);
          infowindow.open(map, marker);
        });

        kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close();
        });
      }

      function displayPlaces(places, imageSrc) {
        const listEl = document.getElementById('placesList');
        const menuEl = document.getElementById('menu_wrap');
        const fragment = document.createDocumentFragment();
        const bounds = new kakao.maps.LatLngBounds();
        removeAllChildNods(listEl);
        removeMarker();
        for (let i = 0; i < places.length; i++) {
          const placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);
          const marker = addMarker(placePosition, i, imageSrc);
          const itemEl = getListItem(i, places[i]);
          bounds.extend(placePosition);

          kakao.maps.event.addListener(marker, 'mouseover', () => {
            displayInfowindow(marker, places[i].place_name);
          });

          kakao.maps.event.addListener(marker, 'mouseout', () => {
            infowindow.close();
          });

          itemEl.onmouseover = () => {
            displayInfowindow(marker, places[i].place_name);
          };

          itemEl.onmouseout = () => {
            infowindow.close();
          };

          fragment.appendChild(itemEl);
        }
        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;
        map.setBounds(bounds);
      }

      function getListItem(index, places) {
        const el = document.createElement('li');
        let itemStr = `<span class="markerbg marker_${index + 1}"></span>
            <div class="info">
                <h5>${places.place_name}</h5>`;

        if (places.road_address_name) {
          itemStr += `<span>${places.road_address_name}</span>
                <span class="jibun gray">${places.address_name}</span>`;
        } else {
          itemStr += `<span>${places.address_name}</span>`;
        }

        itemStr += `<span class="tel">${places.phone}</span></div>`;
        el.innerHTML = itemStr;
        el.className = 'item';
        return el;
      }

      function addMarker(position, idx, imageSrc) {
        const imageSize = new kakao.maps.Size(36, 37);
        const imgOptions = {
          spriteSize: new kakao.maps.Size(36, 691),
          spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10),
          offset: new kakao.maps.Point(13, 37)
        };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);
        const marker = new kakao.maps.Marker({
          position: position,
          image: markerImage
        });
        return marker;
      }

      function removeMarker() {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];
      }

      function displayPagination(pagination) {
        const paginationEl = document.getElementById('pagination');
        const fragment = document.createDocumentFragment();
        while (paginationEl.hasChildNodes()) {
          paginationEl.removeChild(paginationEl.lastChild);
        }
        for (let i = 1; i <= pagination.last; i++) {
          const el = document.createElement('a');
          el.href = "#";
          el.innerHTML = i;
          if (i === pagination.current) {
            el.className = 'on';
          } else {
            el.onclick = ((i) => {
              return () => {
                pagination.gotoPage(i);
              };
            })(i);
          }
          fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
      }

      function displayInfowindow(marker, title) {
        const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
        infowindow.setContent(content);
        infowindow.open(map, marker);
      }

      function removeAllChildNods(el) {
        while (el.hasChildNodes()) {
          el.removeChild(el.lastChild);
        }
      }

      let markers = [];
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}></div>
      <div id="menu_wrap" className="bg_white">
        <hr />
        <ul id="placesList"></ul>
        <div id="pagination"></div>
      </div>
    </div>
  );
};

export default KakaoMap;
