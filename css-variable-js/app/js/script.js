const inputs = document.querySelectorAll('.control input.color');
const input2 = document.querySelectorAll('.control input.padding');
const input3 = document.querySelectorAll('.control input.blur');
const changable = document.querySelector('.changable');

function handlerUpdate(){
    // const suffix = this.dataset.sizing || '';
    changable.style.setProperty(`background`,this.value);
    changable.style.setProperty(`padding`,this.value+'px');
    changable.style.setProperty(`filter`,this.value+'px');
    console.log(this.value);
    // console.log(`${$blur}`)
}

inputs.forEach(input => input.addEventListener('change',handlerUpdate));
input2.forEach(input => input.addEventListener('change',handlerUpdate));
input3.forEach(input => input.addEventListener('change',handlerUpdate));
inputs.forEach(input => input.addEventListener('mousemove',handlerUpdate));
input2.forEach(input => input.addEventListener('mousemove',handlerUpdate));
input3.forEach(input => input.addEventListener('mousemove',handlerUpdate));