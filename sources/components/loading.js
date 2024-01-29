window.addEventListener("DOMContentLoaded", () => {
  console.log("=== DOMContentLoaded loading page ===");

  function GF_Loader() {
    const DURATION = 3000;
    const loader = document.createElement("div");
    loader.classList.add("page-loader");
    loader.classList.add("loading-image-rotate");
    loader.innerHTML =
      '<div class="animation"> <span class="wa-hidden">로딩중</span> </div> <div class="page-loader-msg">text</div>';

    const show = (duration) => {
      console.log("=== GF_Loader show  ===", duration);
      // loader 만 넣을 거라서 apeendChild 로 함
      // document.body.append(loader. '텍스트');
      document.body.appendChild(loader);
      if (duration > 0 && duration === "undefined") {
      }
      setTimeout(() => {
        hide();
      }, duration ?? DURATION);
    };

    const hide = () => {
      console.log("=== GF_Loader hide ===");
      loader.remove();
    };

    return {
      show,
      hide,
    };
  }

  window.GF_Loader = GF_Loader();
});
