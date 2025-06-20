# Suno

### Мультиплеерная игра поверх web-rtc.

[![Test covered](https://github.com/asavan/fool/actions/workflows/static.yml/badge.svg)](https://github.com/asavan/fool/actions/workflows/static.yml)
[![google play](https://img.shields.io/endpoint?color=green&logo=google-play&logoColor=green&url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Dru.asavan.suno%26gl%3DUS%26hl%3Den%26l%3D%24name%26m%3D%24version)](https://play.google.com/store/apps/details?id=ru.asavan.suno)

![Suno](/screenshots/screen_green.png "Suno")

### Правила
1) Из коробки с игрой https://service.mattel.com/instruction_sheets/42001pr.pdf
2) Альтернативные https://www.unorules.com/

### Реализация
когда все игроки присоединились сервер нажимает done и приступает к расстановке игроков.
игроки присоединяются по очереди в порядке сканирования кода.




Выбираем место для каждого игрока.
У сервера интерфейс - круг на котором расположены игроки, нажимая последовательно на 2х игроков мы меняем их местами
Игроки обязаны представиться перед началом игры, имя хранится в session storage( для сброса надо закрыть окно браузера)
после того как игроки расставлены, сервер нажимает старт в центре круга

имя можно передать через настройки, тогда оно перетрет то что находится в sessionStorage

### План доработок:

1) Добавить таймер на ход, и автоход, если таймер истек.
2) Анимация раздачи карт из колоды и в сброс +
3) Сделать меню для настроек, чтоб менять прям во время игры
4) Дать возможность перемещать игроков по экрану
5) звук УНО! когда осталась одна карта (задается в настройках)
6) история ходов
7) Использовать https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader вместо file://
    https://joshuatz.com/posts/2021/webviewassetloader-webviewclient-kotlin/
    https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
8) при выигрыше карты падают как в солитере
9) защита от клика (сначала выбираем карту которой ходить, потом вторым кликом ходим) (настройка)
10) научиться сервить файлы из Internal Storage

#### Другие реализации
1) React and Socket.IO https://github.com/mizanxali/uno-online
2) Canvas + Socket.IO https://eperezcosano.github.io/uno-part2

#### Полезное
Запуск одного теста
node --test --test-name-pattern="test"    
git tag v1.4.9 HEAD -m "Version 1.4.9 released"
