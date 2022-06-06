import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import View from '../../../public/controller/js/view.js';

describe('#View -  test suite for presentatio layer', () => {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.window = dom.window;

  function makeBtnElement(
    { text, classList } = {
      text: '',
      classList: { add: jest.fn(), remove: jest.fn() },
    }
  ) {
    return {
      onclick: jest.fn(),
      classList,
      innerHTML: text,
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    // jest
    //   .spyOn(document, document.getElementById.name)
    //   .mockReturnValue(makeBtnElement());
  });

  test('#changeCommandeVisibility() -  given hide = true, should add unassigned class and reset onclick', () => {
    const view = new View();
    const btn = makeBtnElement();
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([btn]);
    view.changeCommandVisibility(true);
    expect(btn.classList.add).toHaveBeenCalledWith('unassigned');
    expect(btn.onclick.name).toStrictEqual('onClickReset');
    expect(() => btn.onclick()).not.toThrow();
  });

  test('#changeCommandeVisibility() -  given hide = false, should remove unassigned class and reset onclick', () => {
    const view = new View();
    const btn = makeBtnElement();
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([btn]);
    view.changeCommandVisibility(false);
    expect(btn.classList.add).not.toHaveBeenCalled();
    expect(btn.classList.remove).toHaveBeenCalledWith('unassigned');
    expect(btn.onclick.name).toStrictEqual('onClickReset');
    expect(() => btn.onclick()).not.toThrow();
  });

  test('#onLoad -  given hide = false, should remove unassigned class and reset onclick', () => {
    const view = new View();
    jest.spyOn(view, 'changeCommandVisibility').mockReturnValue();
    view.onLoad();
    expect(view.changeCommandVisibility).toHaveBeenCalled();
  });
});
