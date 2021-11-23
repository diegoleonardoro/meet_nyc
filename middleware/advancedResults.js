const advancedResults = (model, populate) => async (req, res, next) => {

    let query;

    // Copy req.query
    const reqQuery = { ...req.query };


    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']; // we do not want to include these as fields of the query. If we do not remove them, they will be perceived as object keys.

    //Loop over removeFields and delete them from reqQuery. reqQuery is an object containing an object with all the queries sent by the client
    removeFields.forEach(param => delete reqQuery[param]);

    /*
    {
        select: 'userName,propertyType, ownOrRent', // In the above line, we are deleting this line
        ownOrRent: 'I rent this place'
    }
    */

    // Create query string
    let queryStr = JSON.stringify(reqQuery); // We need to convert this into a string so that we can apply regex to it. 

    // Create operators {$gt, $gte, etc}
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`) // in the query url, the user can select specific fields of the Input schema and apply some monggose funcionality to that field to make some filtering to the data returned. 
    // $lte selects the documents where the value of the field is less than or equal to (i.e. <=) the specified value.
    // $gte greater or equal
    // $in means "contain" ---> {{URL2}}/inputs?userName[in]=diego
    // in the url, the query looks like this: {{URL2}}/inputs/?avgPrice[lte]=30000
    // we could also add more filter in the url:  {{URL2}}/inputs/?avgPrice[gt]=30000&location.city=Bronx
    // filering by another field: {{URL2}}/inputs/?location.city[in]=Brooklyn

    // Find resource
    query = model.find(JSON.parse(queryStr)); //.populate('realEstateVars');//1*


    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Filter fields from data base 
    if (req.query.select) { // if the query has "select", then we are going to keep building on to the query 
        const fields = req.query.select.split(",").join(" "); // .select takes values in this format = ["userName propertyType"]
        query = query.select(fields); // query.select() selects the fields that were sent by the client ---->  inputs/?select=userName,propertyType
        // As we do a filerting query, we could also add more condition to the query:
        // {{URL2}}/inputs/?select=userName,propertyType, ownOrRent&ownOrRent=I rent this place
    }
    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Pagination 
    const page = parseInt(req.query.page, 10) || 1; // when we set a "limit" of how many records are shown, breaking all the records into pages, so with "page" we determine what page we display.
    const limit = parseInt(req.query.limit, 10) || 100; // limit represents the limit of records that will be displayed on the screen 
    const startIndex = (page - 1) * limit;
    // page * limit = number of records that are shown 
    // page -1 * limit = number of records that are shown minus the limit, meaning that startIndex will be --->> page * limit "minus" limit <<---
    const endIndex = page * limit;
    const total = await model.countDocuments();

    // if page=1 & limit=2, then startIndex=0, so ---> query.skip(0).limit(2);
    // if page=3 & limit=5, then startIndex=4, so ---> query.skip(10).limit(2);

    query = query.skip(startIndex).limit(limit);

    // {{URL2}}/inputs/?select=userName,propertyType, ownOrRent&ownOrRent=I rent this place& -->"sort=userName"<-- & -->"limit=1&page=1"<--
    // Call the skip() method on a cursor to control where MongoDB begins returning results.
    // Use the limit() method on a cursor to specify the maximum number of documents the cursor will return.

    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --

    if (populate) {
        query = query.populate(populate);
    }

    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Sorting results 
    // Sorting in mongodb = 1 ascending, -1 descending. 
    if (req.query.sort) {// if the query has "sort", then we are going to keep building on to the query 
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
        // {{URL2}}/inputs/?select=userName,propertyType, ownOrRent&ownOrRent=I rent this place&sort=-userName
    }
    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    // Executing query
    const results = await query;

    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Pagination result 
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();

}

module.exports = advancedResults;



/*

1*
Population is the process of automatically replacing the specified paths 
in the document with document(s) from other collection(s). 
We may populate a single document, multiple documents, 
a plain object, multiple plain objects, or all objects returned from a query.

In this case, we are populating the realEstateVars schema inside the Inputs schema

*/