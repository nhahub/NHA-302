/* exmaple how to use
    let apiFeature = new ApiFeatures(productModel.find(),req.query).pagination().filter().sort().search().fields()
    let results = await apiFeature.myQuery
    res.status(200).json({ message: "success", page: apiFeature.page , data: results })
*/
export default class ApiFeatures {
    constructor(myQuery, queryString) {
        this.myQuery = myQuery;
        this.queryString = queryString;
    }
    pagination() {
        let page = this.queryString.page * 1 || 1
        if (page <= 0) page = 1
        let skip = (page - 1) * 4
        this.page = page
        this.myQuery.skip(skip).limit(4)
        return this;
    }

    filter(){
        let filterObj = {...this.queryString}
    let excludedQuery = ['page','sort','keyword','fields']
    excludedQuery.forEach((q)=>{
        delete filterObj[q]
    })
    filterObj = JSON.stringify(filterObj)
    filterObj =filterObj.replace(/\bgt|gte|lt|lte\b/g,match => `$${match}`)
    filterObj = JSON.parse(filterObj)
    this.myQuery.find(filterObj)
    return this;
    }

    sort(){
        if(this.queryString.sort){
            let sortBy = this.queryString.sort.split(",").join(" ")
            this.myQuery.sort(sortBy)
        }
        return this;
    }

    search(){
        if(this.queryString.keyword){
            this.myQuery.find({
                $or:[
                    {title:{$regex:this.queryString.keyword,$options:'i'}},
                    {description:{$regex:this.queryString.keyword,$options:'i'}}
                ]
            })
        }
        return this;
    }

    fields(){
        if(this.queryString.fields){
            let fieldsSelect = this.queryString.fields.split(",").join(" ")
            this.myQuery.select(fieldsSelect)
        }
        return this;
    }


}