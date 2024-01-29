// util
const addClassName = (className, target) => {
  if (target.classList.contains(className)) return;
  target.classList.add(className);
};
const removeClassName = (className, target) => {
  if (!target.classList.contains(className)) return;
  target.classList.remove(className);
};

// action
const createBtnClear = (target) => {
  const inputInner = target.querySelector(".form-input-inner");
  const input = inputInner.querySelector("input");

  const btnClear = document.createElement("button");
  btnClear.className = "btn-clear";
  btnClear.innerHTML = '<i class="fas fa-xmark" title="지우기"></i>';

  // 검색 버튼 있는 경우 고려해 분기 처리
  if (input === inputInner.lastElementChild) {
    inputInner.appendChild(btnClear);
  } else {
    inputInner.insertBefore(btnClear, inputInner.children[1]);
  }

  btnClear.addEventListener("click", refreshInputData);
};

const deleteBtnClear = (target) => {
  const btnClear = target.querySelector(".btn-clear");
  if (btnClear) {
    btnClear.remove();
  }
};

const refreshInputData = ({ currentTarget }) => {
  let input;
  if (currentTarget.previousElementSibling.nodeName === "INPUT") {
    input = currentTarget.previousElementSibling;
    input.value = "";
    input.focus();
  }
};

// focus handler
// focus in|out 분리 해도 됨.
// input 을 여러개를 묶음으로 처리해야 할 경우 수정이 필요함(.form-input-inner 기준으로).
const inputFocusHandler = (e) => {
  const btnOrInput = e.target;
  const container = e.currentTarget;
  // const _inputInner = container.querySelector(".form-input-inner");
  const input = container.querySelector("input");

  // 이벤트 타입으로 분류 - focusin
  if (e.type === "focusin") {
    if (btnOrInput.nodeName === "INPUT" || "BUTTON") {
      addClassName("is-focused", btnOrInput);
      addClassName("is-focused", container);
    }

    // 클리어 버튼 생성 조건
    // 인풋에 포커스가 왔을 때
    // readonly 일 땐 포커스만 가고 버튼은 안 생김(가끔 고객사마다다른 경우도 있음)
    // 이미 닫기 버튼이 있는 경우 생성 안함
    if (
      btnOrInput.nodeName === "INPUT" &&
      !btnOrInput.hasAttribute("readonly") &&
      !btnOrInput?.nextElementSibling?.classList.contains("btn-clear")
    ) {
      createBtnClear(container);
    }
  }
  // 이벤트 타입으로 분류 - focusout
  else if (e.type === "focusout") {
    if (btnOrInput.nodeName === "INPUT" || "BUTTON") {
      removeClassName("is-focused", btnOrInput);
    }

    const delayN = setTimeout(() => {
      //자식 요소 전부 확인을 위해 루프 돌리긴 좀 그래 3개가 최대니까..
      if (
        !input.classList.contains("is-focused") &&
        !input.nextElementSibling?.classList.contains("is-focused") &&
        !input.nextElementSibling?.nextElementSibling?.classList.contains(
          "is-focused"
        )
      ) {
        removeClassName("is-focused", container);
        deleteBtnClear(container);
      }
      clearTimeout(delayN);
    }, 0);
  }
};

const inputComponents = document.querySelectorAll(".form-input");
inputComponents.forEach((input) =>
  input.addEventListener("focusin", inputFocusHandler)
);
inputComponents.forEach((input) =>
  input.addEventListener("focusout", inputFocusHandler)
);
