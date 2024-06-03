# Suno

### Мультиплеерная игра поверх web-rtc.

[![Test covered](https://github.com/asavan/fool/actions/workflows/static.yml/badge.svg)](https://github.com/asavan/fool/actions/workflows/static.yml)

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

1) Убрать имя игрока из движка, оставить только в презентере. +
2) Починить несколько заходов одного клиента подряд (убирать разорванные коннекшены) +
3) Добавить очередь событий, не выполнять след команду, пока не закончена предыдущая +
4) Сделать честный реконнект, с восстановлением состояния +
5) Добавить сортировку карт в руке (отключаемо) +
6) Добавить модальное сообщение о победе +
7) Избавиться от переменной isServer в движке +
8) Добавить таймер на ход, и автоход, если таймер истек.
9) Анимация раздачи карт из колоды и в сброс +
10) Иконку направления сделать background image +
11) Добавить перемешивание колоды discard при окончании основной колоды +
12) добавить анимацию перемешивания
13) добавить эффект переворота карты +
14) Сделать меню для настроек, чтоб менять прям во время игры
15) Дать возможность перемещать игроков по экрану
16) запрещать коннект новых игроков во время игры +
17) написать тесты +
18) удалить глобальные переменные из модуля +
19) иконку направления расположить вокруг карт на столе +
20) колода не отрисовывается до дискарда +
21) звук УНО! когда осталась одна карта (задается в настройках)
22) история ходов
23) починить окно о победе +
24) Использовать https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader вместо file://
    https://joshuatz.com/posts/2021/webviewassetloader-webviewclient-kotlin/
    https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
25) при выигрыше карты падают как в солитере
26) защита от клика (сначала выбираем карту которой ходить, потом вторым кликом ходим) (настройка)
27) научиться сервить файлы из Internal Storage
28) Анимация изменения направления
- [x] в функции join убрать ind и подсчитывать его внутри game. При попытке повторно вставить игрока с тем же externalId обновлять ему имя, а не добавлять новую запись.
- [x] Убрать имя игрока из движка, оставить только в презентере. Для этого написать тест на выигрыш (проверить что появляется окно выигрыша, проверить что там правильное имя игрока). Проверить, что тест зеленый до начала рефакторинга.
- [x] в ф-ции onStart принимать seed с сервера
- [ ] вынести все числовые задержки из engine в settings
- [x] удалить глобальные переменные из модуля uno.js (в частности handlers, let MAX_SCORE, let roundover), удалить ф-цию resetToDefaults
- [x] сделать локальными const handlers в server.js и в client.js

#### Другие реализации
1) React and Socket.IO https://github.com/mizanxali/uno-online
2) Canvas + Socket.IO https://eperezcosano.github.io/uno-part2


