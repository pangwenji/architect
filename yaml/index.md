1.YAML
YAML 是专门用来写配置文件的语言，非常简洁和强大，远比 JSON 格式方便
JS在线验证器
2.基本规则
大小写敏感
使用缩进表示层级关系
缩进时不允许使用Tab键，只允许使用空格。
缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
井号表示注释，从这个字符一直到行尾，都会被解析器忽略。
3. YAML 支持的数据结构
对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）
数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）
纯量（scalars）：单个的、不可再分的值
3.1 对象
对象的一组键值对，使用冒号结构表示。

name: zhufeng
转为 JavaScript 如下。

{ name: 'zhufeng' }
3.2 数组
一组连词线开头的行，构成一个数组。

- apple
- banana
- orange
转为 JavaScript 如下

[ 'apple', 'banana', 'orange' ]
3.3 复合结构
对象和数组可以结合使用，形成复合结构。

name: 'zhufeng'
age: 18
score:
  chinese: 80
  math: 90
  english: 100
{
    name: 'zhufeng',
    age: 18,
    score:
    {
        chinese:80,
        math:90,
        english:100
    }
}
3.4 纯量
纯量是最基本的、不可再分的值。以下数据类型都属于 JavaScript 的纯量。

字符串
布尔值
整数
浮点数
Null
时间
日期
name: 'zhufeng'
age: 10
score: 99.99
married: true
parent: ~
now: 1982-09-03T22:22:22.10-09:00
birthday: 1982-09-03 
参考