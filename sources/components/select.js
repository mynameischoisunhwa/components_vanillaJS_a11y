window.addEventListener("DOMContentLoaded", (event) => {
  let waPrevFocusedElement, waBodyActiveElement;

  function uiCombobox(container, containers) {
    const formSelectInner = container.querySelector(".form-select-inner");
    const select = container.querySelector("select");
    let combobox, listbox, options;
    let activeOption, prevActivatedOption, activeOptionIndex;

    // util
    function setAttributes(element, attributes) {
      Object.keys(attributes).forEach((attr) => {
        element.setAttribute(attr, attributes[attr]);
      });
    }

    function toggleClass(element, className) {
      element.classList.toggle(className);
    }
    /**
     * arguments
     * formSelectInner: inner element
     * select: original select tag
     * option: default option
     */
    const addCombobox = (formSelectInner, select) => {
      // create custom combobox
      const combobox = document.createElement("div");
      const comboboxAttributes = {
        tabIndex: "0",
        role: "combobox",
        "aria-expanded": "false",
        "aria-autocomplete": "list",
        "aria-controls": "listbox-" + select.id,
        "aria-activedescendant": "",
        "aria-haspopup": "listbox",
        "aria-labelledby": select.id,
        class: "ui-combobox wa-focusable",
      };

      combobox.innerHTML = `<span></span><i class="fas fa-arrow-down"></i>`;
      setAttributes(combobox, comboboxAttributes);
      formSelectInner.prepend(combobox);
    };

    const addListBox = (formSelectInner, select) => {
      const listboxWrap = document.createElement("div");
      listboxWrap.classList.add("ui-listboxwrap");
      const optionData = [...select.options].map((option) => option.innerText);
      const roleOption = optionData.map(
        (t, i) =>
          `<li><span id=${
            "option" + i + "-" + select.id
          } class="ui-option" role="option" tabindex="-1">${t}</span></li>`
      );
      listboxWrap.innerHTML = `
        <ul 
          id=${"listbox-" + select.id} 
          class="ui-listbox" 
          tabindex="-1" 
          role="listbox" 
          aria-hidden="true"
        >
          ${roleOption.join("")}
        </ul>`;

      formSelectInner.insertBefore(listboxWrap, select);
    };

    // action
    // handler
    const comboboxKeydownHandler = ({ key }) => {
      let TFComboboxExpanded = combobox.getAttribute("aria-expanded");

      // enter || space => 리스트 오픈
      if (key === "Enter" || key === " ") {
        combobox.setAttribute(
          "aria-expanded",
          TFComboboxExpanded === "true" ? false : true
        );
        toggleClass(listbox, "is-active");

        if (TFComboboxExpanded === "true") {
          combobox.firstElementChild.innerText = activeOption.innerText;
          select.options[activeOptionIndex].selected = true;
        }
      }

      if (key === "ArrowUp" || key === "ArrowDown") {
        event.preventDefault();

        if (TFComboboxExpanded === "true") {
          if (key === "ArrowUp") {
            if (activeOptionIndex > 0) {
              prevActivatedOption = options[activeOptionIndex];
              activeOption = options[activeOptionIndex - 1];
              activeOptionIndex = activeOptionIndex - 1;
            }
          } else if (key === "ArrowDown") {
            if (activeOptionIndex < options.length - 1) {
              prevActivatedOption = options[activeOptionIndex];
              activeOption = options[activeOptionIndex + 1];
              activeOptionIndex = activeOptionIndex + 1;
            }
          }
          prevActivatedOption.classList.remove("is-active");
          activeOption.classList.add("is-active");
          combobox.setAttribute(
            "aria-activedescendant",
            options[activeOptionIndex].id
          );
        }
        // 진입
        else {
          combobox.setAttribute("aria-expanded", true);
          listbox.classList.add("is-active");
        }
      }
    };

    const comboboxClickHandler = () => {
      console.log("==== comboboxClickHandler ====");
      // 기존 콤보박스 속성 저장
      let TFComboboxExpanded = combobox.getAttribute("aria-expanded");

      // 전부 삭제
      // 포커스 이벤트로 동시에 처리함
      // containers.forEach((_container) => {
      //   _container
      //     .querySelector(".ui-combobox")
      //     .setAttribute("aria-expanded", false);
      //   _container.querySelector(".ui-listbox").classList.remove("is-active");
      // });

      // 타겟만 토글
      if (TFComboboxExpanded === "true") {
        combobox.setAttribute("aria-expanded", false);
        listbox.classList.remove("is-active");
      } else {
        combobox.setAttribute("aria-expanded", true);
        listbox.classList.add("is-active");
      }
    };

    const listboxMouseOverOutHandler = ({ type, target }) => {
      if (target.classList.contains("ui-option")) {
        if (type === "mouseover") {
          prevActivatedOption?.classList.remove("is-active");

          activeOption = target;
          activeOptionIndex = [...options].indexOf(activeOption);
          activeOption.classList.add("is-active");
          combobox.setAttribute("aria-activedescendant", activeOption.id);
        } else if (type === "mouseout") {
          prevActivatedOption = target;
          activeOption.classList.remove("is-active");
        }
      }

      if (target.nodeName === "UL") {
        if (type === "mouseleave") {
          prevActivatedOption?.classList.add("is-active");
        }
      }
    };

    const listboxMouseDownHandler = ({ target, button }) => {
      if (target.classList.contains("ui-option") && button === 0) {
        activeOption = target;
        activeOptionIndex = [...options].indexOf(activeOption);
        combobox.firstElementChild.innerText = activeOption.innerText;
        select.options[activeOptionIndex].selected = true;

        // 리스트 박스가 닫힐 때, mouseout 이벤트가 일어남. 다시 넣어주기
        listbox.classList.remove("is-active");
        combobox.setAttribute("aria-expanded", false);
        combobox.focus();
      }
    };

    // init
    const init = () => {
      // 오리지널 실렉트 숨김처리
      select.style.display = "none";

      addCombobox(formSelectInner, select);
      addListBox(formSelectInner, select);

      combobox = formSelectInner.querySelector(".ui-combobox");
      listbox = formSelectInner.querySelector(".ui-listbox");
      options = listbox.querySelectorAll(".ui-option");

      // list 의 첫번째 ui-option 의 id 연결해줌.
      combobox.setAttribute("aria-activedescendant", options[0].id);
      combobox.firstElementChild.innerText = options[0].innerText;
      select.options[0].selected = true;
      options[0].classList.add("is-active");
      activeOption = options[0];
      activeOptionIndex = 0;
      prevActivatedOption = null;
    };
    init();

    combobox.addEventListener("click", comboboxClickHandler);
    formSelectInner.addEventListener("keydown", comboboxKeydownHandler);

    listbox.addEventListener("mouseover", listboxMouseOverOutHandler);
    listbox.addEventListener("mouseout", listboxMouseOverOutHandler);
    listbox.addEventListener("mouseleave", listboxMouseOverOutHandler);

    listbox.addEventListener("mousedown", listboxMouseDownHandler);

    // 포커스는 문서 전체 통합관리 해야함.
    // relatedTarget 이 뭔지 알 수 없음
    // 포커스에 관한 공통 정책을 정해서 관리 하자
    // blur 쓰면 옵션 클릭 하는 순간 닫혀 버림 포커스가 옵션으로 옮겨 감
    // focusout 쓰면 마우스 입벤트 실행 전에 닫혀 버려서 못 씀
    // 포커스를 크게 잡던가.. 이것도 접근성 오류 가능서 있음
    // 전체 포커스 이동관리가 제일 좋은 것 같음.
    combobox.addEventListener("focus", (e) => {
      if (e.relatedTarget) {
        // e.relatedTarget.setAttribute("aria-expanded", false);
        // console.dir(e.relatedTarget);
        // e.relatedTarget?.nextElementSibling?.children[0].classList.remove(
        //   "is-active"
        // );
        GF_FocusClearHandler(e.relatedTarget);
      }
    });
  }
  // 폼관련 요소는 다른 개발자들이 개별 컨트롤 하려는 경우가 있음.
  // 빼놓는게 속편함
  window.uiCombobox = uiCombobox;

  const containers = document.querySelectorAll(".form-select");

  // 포커스 요구사항에 따라서 문서 전체적인 관리가 필요함
  const waFocusableNodes = document.querySelectorAll(".wa-focusable");

  containers.forEach((container) => uiCombobox(container, containers));
});

function GF_FocusClearHandler(target) {
  console.log("==== GF_FocusClearHandler ====");
  const type = target?.role;

  switch (type) {
    case "combobox":
      console.log("==== combobox ====");

      target.setAttribute("aria-expanded", false);
      target?.nextElementSibling?.children[0].classList.remove("is-active");
      break;

    default:
      break;
  }
}
