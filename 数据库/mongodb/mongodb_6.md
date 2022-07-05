7.3 聚合的表达式 #
表达式	描述	实例
$sum	计算总和。	db.article.aggregate([{$group : {_id : "$uid", num_tutorial : {$sum : "$visit"}}}])
$avg	计算平均值	db.article.aggregate([{$group : {_id : "$uid", num_tutorial : {$avg : "$visit"}}}])
$min	获取集合中所有文档对应值得最小值。	db.article.aggregate([{$group : {_id : "$uid", num_tutorial : {$min : "$visit"}}}])
$max	获取集合中所有文档对应值得最大值。	db.article.aggregate([{$group : {_id : "$uid", num_tutorial : {$max : "$visit"}}}])
$push	把某列的所有值都放到一个数组中	db.article.aggregate([{$group : {_id : "$uid", url : {$push: "$url"}}}])
$addToSet	返回一组文档中所有文档所选字段的全部唯一值的数组	db.article.aggregate([{$group : {_id : "$uid", url : {$addToSet : "$url"}}}])
$first	根据资源文档的排序获取第一个文档数据,可能为null	db.article.aggregate([{$group : {_id : "$uid", first_url : {$first : "$url"}}}])
$last	根据资源文档的排序获取最后一个文档数据,可能为null	db.article.aggregate([{$group : {_id : "$uid", last_url : {$last : "$url"}}}])
db.article.insert({uid:1,content:'3',url:'url1'});
db.article.insert({uid:1,content:'4',url:'url1'});
db.article.insert({uid:1,content:'5',url:'url2'});
把某列的所有值都放到一个数组中
db.article.aggregate([{$group : {_id : "$uid", url : {$push: "$url"}}}])
{ "_id" : 1, "url" : [ "url1", "url1", "url2"] }
7.4 管道的概念
管道在Unix和Linux中一般用于将当前命令的输出结果作为下一个命令的参数。 MongoDB的聚合管道将MongoDB文档在一个管道处理完毕后将结果传递给下一个管道处理。管道操作是可以重复的。

$project：修改输入文档的结构。可以用来重命名、增加或删除字段，也可以用于创建计算结果以及嵌套文档。
$match：用于过滤数据，只输出符合条件的文档。$match使用MongoDB的标准查询操作
$limit：用来限制MongoDB聚合管道返回的文档数。
$skip：在聚合管道中跳过指定数量的文档，并返回余下的文档。
$unwind：将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
$group：将集合中的文档分组，可用于统计结果。
$sort：将输入文档排序后输出。
7.4.1 过滤显示字段
修改输入文档的结构。可以用来重命名、增加或删除字段，也可以用于创建计算结果以及嵌套文档
db.article.aggregate(
  { $project : {
      _id:0,
      content : 1 ,
  }}
);
7.4.2 过滤文档
用于过滤数据，只输出符合条件的文档。$match使用MongoDB的标准查询操作
db.article.aggregate( [
  { $match : { visit : { $gt : 10, $lte : 200 } } },
  { $group: { _id: '$uid', count: { $sum: 1 } } }
]);
7.4.3 跳过指定数量
在聚合管道中跳过指定数量的文档，并返回余下的文档。 `js var db = connect('school'); var vistors = []; for(var i=1;i<=20;i++){ vistors.push({uid:i,visit:i}); } print(vistors.length); db.vistors.insert(vistors);
db.vistors.aggregate( [ { $match : { visit : { $gt : 10, $lte : 200 } } }, { $group: { _id: '$uid', count: { $sum: 1 } } }, { $skip : 1 } ] );


#### 7.4.5 $unwind
- 将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
- 使用$unwind可以将weekday中的每个数据都被分解成一个文档,并且除了weekday的值不同外,其他的值都是相同的
```js
db.vistors.aggregate( [
    { $project : {_id:1,uid:1,type:1,visit:1}},
    { $match : { visit : { $gte : 1, $lte : 10 } } },
    { $unwind:'$type'}
]);
7.4.6 $group
将集合中的文档分组，可用于统计结果。
db.vistors.aggregate( [
  { $project : {_id:1,uid:1,type:1,visit:1}},
  { $match : { visit : { $gte : 1, $lte : 10 } } },
  { $unwind:'$type'},
  { $group: { _id: '$uid', count: { $sum: 1 } } },
  { $sort: {_id:1} },
  { $skip : 5 },
  { $limit: 5 }
]);
7.4.5 Mongoose中使用
Article.aggregate([
                        { $match : { visit : { $gt : 10, $lte : 200 } } },
                        { $group: { _id: '$uid', count: { $sum: 1 } } },
                        { $skip : 1 }
 ])
                .
https://github.com/sodino/MongoDemo/blob/master/app.js