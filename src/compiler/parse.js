// 正则表达式
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 开始标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 结束标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
const startTagClose = /^\s*(\/?)>/; // <div><br/>

// vue3 不是采用正则匹配
// 对模板进行编译处理

export function parseHTML(html) {

  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = [] //用于存放元素
  let currentParent; //指向栈中的最后一个
  let root;

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  // 利用栈型结构 转换成一棵抽象语法树
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs)
    if (!root) {
      root = node
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node
  }
  function chars(text) {
    text = text.replace(/\s/g, '')
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  function end() {
    stack.pop()
    currentParent = stack[stack.length - 1]
  }

  function advance(n) {
    html = html.substring(n)
  }
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)
      let attr, end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
      }
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false
  }
  while (html) {
    // 如果textEnd 为0 说明是一个开始标签或结束标签
    // 如果textEnd> 0 说明就是文本的结束位置
    let textEnd = html.indexOf('<');
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) { // 开始标签
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd)
      if (text) {
        chars(text)
        advance(text.length)
      }
    }
  }
  console.log(root, "root");
  return root
}