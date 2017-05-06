function range(from, to) {
  const ans = [];
  for (let x = from; x <= to; x++) {
    ans.push(x);
  }
  return ans;
}

function d(elementType, attributes, ...children) {
  const node = document.createElement(elementType);
  Object.keys(attributes).forEach(name => node.setAttribute(name, attributes[name]));
  for (let child of children) {
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}
