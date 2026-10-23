const counter = document.getElementById("counter");
const decreaseBtn = document.getElementById("decrease");
const resetBtn = document.getElementById("reset");
const increaseBtn = document.getElementById("increase");

let count = 0;

function updateCounter() {
    counter.textContent = count;
    counter.classList.add("animate");
    setTimeout(() => {
        counter.classList.remove("animate");
    }, 150);
    if (count > 0) {
        counter.style.color = "#22c55e";
    }
    else if (count < 0) {
        counter.style.color = "#ef4444";
    }
    else {
        counter.style.color = "#00f2fe";
    }

}

increaseBtn.addEventListener("click", () => {
    count++;
    updateCounter();
});

decreaseBtn.addEventListener("click", () => {
    count--;
    updateCounter();
});

resetBtn.addEventListener("click", () => {
    count = 0;
    updateCounter();
});