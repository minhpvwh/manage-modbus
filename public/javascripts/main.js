function showDivElement(element)
{
    document.getElementById('inputBetween').style.display = element.value === 'between' ? 'block' : 'none';
    document.getElementById('inputNotBetween').style.display = element.value !== 'between' ? 'block' : 'none';
}