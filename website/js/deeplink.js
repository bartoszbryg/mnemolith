const Recallith = {
    scheme: "recallith",
    async isInstalled() {
        return new Promise(resolve => {
            let settled = false;
            const frame = document.createElement("iframe");
            frame.hidden = true;
            frame.src = `${this.scheme}://ping`;
            document.body.appendChild(frame);
            const finish = value => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                frame.remove();
                resolve(value)
            };
            const timer = setTimeout(() => finish(false), 2000);
            window.addEventListener("blur", () => finish(true), {
                once: true
            })
        })
    },
    open(action = "open", params = {}) {
        const url = new URL(`${this.scheme}://${action}`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        location.href = url.toString()
    },
    async openSearch(query) {
        if (await this.isInstalled()) this.open("query", {
            q: query
        });
        else location.href = `download.html?from=search&q=${encodeURIComponent(query)}`
    }
};
export default Recallith;