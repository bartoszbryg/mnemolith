const Recallith = {
   scheme: "recallith",

   open(action = "open", params = {}) {
      const url = new URL(`${this.scheme}://${action}`);

      Object.entries(params).forEach(([key, value]) => {
         url.searchParams.set(key, String(value));
      });

      window.location.href = url.toString();
   },

   openSearch(query) {
      const fallback =
         `download.html?from=search&q=${encodeURIComponent(query)}`;

      let applicationOpened = false;

      const markOpened = () => {
         applicationOpened = true;
      };

      window.addEventListener("blur", markOpened, { once: true });
      document.addEventListener(
         "visibilitychange",
         () => {
            if (document.hidden) {
               markOpened();
            }
         },
         { once: true },
      );

      window.setTimeout(() => {
         if (!applicationOpened) {
            window.location.href = fallback;
         }
      }, 2500);

      this.open("query", { q: query });
   },
};

export default Recallith;