function main() {
  const counterWidth = document.getElementById('counter__width');
  const counterHeight = document.getElementById('counter__height');
  const ariaText = document.getElementById('counter__aria-text');

  showViewportSize();

  window.addEventListener('resize', showViewportSize);

  function getWindowDimentions() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function showViewportSize() {
    const { width, height } = getWindowDimentions();
    counterWidth.innerText = width;
    counterHeight.innerText = height;
    ariaText.innerText = `Window is now ${width} pixels wide by ${height} pixels high.`;
  }
}
main();
