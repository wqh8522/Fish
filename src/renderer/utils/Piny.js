import { pinyin } from './PinyConst'


export default {
  chineseToPinYin: function (l1) {
    const l2 = l1.length;
    let I1 = '';
    // var reg = new RegExp()
    for (let i = 0; i < l2; i++) {

      const val = l1.substr(i, 1);
      // if (/^[0-9a-zA-Z]*$/.test(val)) {
      //   I1 += val
      // }
      const name = this.arraySearch(val, pinyin);
      if (name !== false) {
        I1 += name
      } else {
        I1 += val
      }
    }
    I1 = I1.replace(/ /g, '-')
    while (I1.indexOf('--') > 0) {
      I1 = I1.replace('--', '-')
    }
    return I1
  },
  arraySearch: function (l1, l2) {
    for (const name in pinyin) {
      if (pinyin[name].indexOf(l1) !== -1) {
        return this.ucfirst(name)
      }
    }
    return false
  },
  ucfirst: function (l1) {
    if (l1.length > 0) {
      const first = l1.substr(0, 1).toUpperCase();
      // const first = l1.substr(0, 1);
      const spare = l1.substr(1, l1.length);
      return first + spare
    }
  }
}