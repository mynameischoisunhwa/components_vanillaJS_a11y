"use strict";

class UiTab {
  constructor(uiTab) {
    this.uiTab = uiTab;
    this.tablabel = this.uiTab.querySelector(".tablabel");
    this.tablist = this.uiTab.querySelector(".tablist");
    this.tabs = [...this.tablist.querySelectorAll(".tab")];
    this.tabpanels = this.uiTab.querySelectorAll(".tabpanel");
    this.activeTabIndex = 0;

    // setting aria
    this.tablist.setAttribute("role", "tablist");

    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const tabpanel = this.tabpanels[i];
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", this.tabpanels[i].id);
      tabpanel.setAttribute("role", tabpanel);
      tabpanel.setAttribute("aria-labelledby", this.tabs[i].id);
      tabpanel.setAttribute("tabindex", 0);

      // 처음에 이벤트 바로 넘겼음
      // 키다운 핸들러가 넘기는 건 current target 임.
      // 아규먼트를 수정하려다가 파라미터 수정함
      // tab.addEventListener("click", (e) => this.setSelectedTab(e));
      tab.addEventListener("click", (e) => this.clickHandler(e));

      tab.addEventListener("keydown", this.keydownHandler.bind(this));

      if (i === 0) {
        tab.setAttribute("aria-selected", true);
        tab.setAttribute("aria-expanded", true);
        tab.classList.add("is-active");
        tab.removeAttribute("tabindex");

        tabpanel.setAttribute("aria-hidden", false);
        tabpanel.classList.add("is-active");
      } else {
        tab.setAttribute("aria-selected", false);
        tab.setAttribute("aria-expanded", false);
        tab.classList.remove("is-active");
        tab.setAttribute("tabindex", -1);

        tabpanel.setAttribute("aria-hidden", true);
        tabpanel.classList.remove("is-active");
      }
    }
  }

  // 메소드들 간의 파라미터 형태 통일
  // setSelectedTab({ target }) {
  setSelectedTab(currentTab) {
    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      if (tab === currentTab) {
        tab.setAttribute("aria-selected", true);
        tab.setAttribute("aria-expanded", true);
        tab.classList.add("is-active");
        tab.removeAttribute("tabindex");
        tab.focus();
        this.activeTabIndex = i;

        this.tabpanels[i].setAttribute("aria-hidden", false);
        this.tabpanels[i].classList.add("is-active");
      } else {
        tab.setAttribute("aria-selected", false);
        tab.setAttribute("aria-expanded", false);
        tab.classList.remove("is-active");
        tab.setAttribute("tabindex", -1);

        this.tabpanels[i].setAttribute("aria-hidden", true);
        this.tabpanels[i].classList.remove("is-active");
      }
    }
  }

  setSelectedToPreviousTab(currentTab) {
    if (this.tabs[0] === currentTab) {
      this.setSelectedTab(this.tabs[this.tabs.length - 1]);
    } else {
      this.setSelectedTab(this.tabs[this.tabs.indexOf(currentTab) - 1]);
    }
  }

  setSelectedToNextTab(currentTab) {
    if (this.tabs[this.tabs.length - 1] === currentTab) {
      this.setSelectedTab(this.tabs[0]);
    } else {
      this.setSelectedTab(this.tabs[this.tabs.indexOf(currentTab) + 1]);
    }
  }

  clickHandler({ target }) {
    this.setSelectedTab(target);
  }

  // keydownHandler({ key, currentTarget, ...e }) {
  keydownHandler(e) {
    let tf = false;
    switch (e.key) {
      case "ArrowLeft":
        this.setSelectedToPreviousTab(e.currentTarget);
        tf = true;
        break;
      case "ArrowRight":
        this.setSelectedToNextTab(e.currentTarget);
        tf = true;
        break;
      case "Home":
        this.setSelectedTab(this.tabs[0]);
        tf = true;
        break;
      case "End":
        this.setSelectedToNextTab(this.tabs[this.tabs.length - 1]);
        tf = true;
        break;

      // enter, click 일 때만 포커스 이동됨.
      case "Enter":
        tf = true;

      default:
        break;
    }
    if (tf) {
      // 객체분해할당으로 못 가져옴
      e.stopPropagation();
      e.preventDefault();
    }
  }
}

class UiTabBar extends UiTab {
  namespace = "uiTabBar";
  constructor(uiTabBar) {
    super(uiTabBar);
    this.tablist.children[0].style.transition = "transform 0.3s";
    this.tablistWidth = this.tablist.offsetWidth;
    this.tablistInnerWidth = 0;
    this.tabsWidth = [];
    this.tabsTotalWidth = 0;
    this.tabsOffsetLeft = [];
    this.barLeft = [];
    this.barScale = [];
    this.barInitialWidth = 0;

    this.tablistColumnGap = 0;

    // <div class="bar" aria-hidden="true"></div>;
    this.bar = document.createElement("div");
    this.bar.classList.add("bar");
    this.bar.setAttribute("aria-hidden", true);
    this.bar.style.transition = "left 0.2s, transform 0.3s";
    this.tablist.children[0].append(this.bar);

    this.setTabWidth();
    this.bar.style.width = `${this.barInitialWidth}px`;
    this.moveTabBar();

    this.tabs.forEach((tab) => {
      tab.addEventListener("focus", this.moveTabBar.bind(this));
    });
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", this.moveTabBar.bind(this));
    });
  }

  setTabWidth() {
    this.tabs.forEach((tab) => {
      this.tabsWidth.push(tab.offsetWidth);
      this.tabsOffsetLeft.push(tab.offsetLeft);
      this.tabsTotalWidth = this.tabsTotalWidth + tab.offsetWidth;
    });

    this.barInitialWidth = Math.ceil(this.tabsTotalWidth / this.tabs.length);
    this.barLeft = this.tabsOffsetLeft.map((left, i) =>
      Math.ceil(left + this.tabsWidth[i] / 2 - this.barInitialWidth / 2)
    );
    this.barScale = this.tabsWidth.map((w) => w / this.barInitialWidth);

    // 이렇게 일일이 넣어줘야 해서 다들 지원을 안하는 거였구만.
    this.tablistColumnGap = window
      .getComputedStyle(this.tablist.children[0])
      .columnGap.replace(/\D/g, "");
    this.tablistInnerWidth =
      this.tabsTotalWidth + this.tablistColumnGap * (this.tabsWidth.length - 1);
  }

  moveTabBar() {
    setTimeout(() => {
      const activeBarLeft = this.barLeft[this.activeTabIndex];
      this.bar.style.left = activeBarLeft + "px";
      this.bar.style.transform = `scaleX(${
        this.barScale[this.activeTabIndex]
      })`;

      // 비교 기준
      const tablistHalfWidth = this.tablistWidth / 2;
      const activeTabHalfLeft =
        this.tabsOffsetLeft[this.activeTabIndex] +
        this.tabsWidth[this.activeTabIndex] / 2;

      let transLeft = activeTabHalfLeft - tablistHalfWidth;

      if (transLeft > 0) {
        if (this.tablistInnerWidth - activeTabHalfLeft < tablistHalfWidth) {
          transLeft = (this.tablistInnerWidth - this.tablistWidth) * -1;
        } else {
          transLeft = transLeft * -1;
        }
      } else if (transLeft <= 0) {
        transLeft = 0;
      }

      this.tablist.children[0].style.transform = `translateX(${transLeft}px)`;
    }, 10);
  }
}

window.addEventListener("load", function () {
  var uiTabs = document.querySelectorAll(".ui-tab");
  for (var i = 0; i < uiTabs.length; i++) {
    new UiTabBar(uiTabs[i]);
  }
});
