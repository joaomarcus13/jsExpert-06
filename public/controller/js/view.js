export default class View {
  onLoad() {
    this.changeCommandVisibility();
  }

  changeCommandVisibility(hide = true) {
    Array.from(document.querySelectorAll('[name="command"]')).forEach((btn) => {
      const fn = hide ? 'add' : 'remove';
      btn.classList[fn]('unassigned');
      function onClickReset() {}
      btn.onclick = onClickReset;
    });
  }
}
