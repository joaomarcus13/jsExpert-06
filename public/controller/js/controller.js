export default class Controller {
  constructor({ view, service }) {
    this.view = view;
    this.service = service;
  }

  static initialize(dependecies) {
    const controller = new Controller(dependecies);
    controller.onLoad();
    return controller;
  }

  onLoad() {
    this.view.onLoad();
  }
}
