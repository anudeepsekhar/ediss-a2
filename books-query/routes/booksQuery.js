import express from 'express';
import makeRequest from './circuit-breaker.js';
import es from '@elastic/elasticsearch'
// const { Client } = require('@elastic/elasticsearch')

const router = express.Router();

const client = new es.Client({ node: 'http://54.91.113.5:9200' });


router.get("/", async (req, res)=>{

    const { keyword } = req.query;
    const keywordRegex = /^[a-zA-Z]+$/;
    if (!keyword || !keywordRegex.test(keyword)) {
        return res.status(400).send('Keyword parameter must be a single word of letters only');
    }

    try{
        const {body} = await client.search({
            index: 'books',
            type: '_doc',
            body: {
                query: {
                    multi_match: {
                        query: keyword, 
                        fields: ['title', 'Author', 'description', 'genre']
                    }
                }
            }
        });

        const books = body.hits.hits.map(hit => hit._source);
        return res.json(books);
    } catch (error) {
        console.error(err);
        return res.status(500).send('Error retrieving books from Elasticsearch');
    }
});

router.get("/:isbn", async (req, res)=>{
    const isbn = req.params.isbn
    console.log(isbn)
    if (!isbn) {
        return res.status(400).send('ISBN parameter is required');
    }

    try{
        const {body} = await client.search({
            index: 'books',
            type: '_doc', // uncomment this line if you are using {es} ≤ 6
            body: {
                query: {
                match: { ISBN: isbn }
                }
            }
        })

        const books = body.hits.hits.map(hit => hit._source);
        if (books.length > 0){
            return res.status(200).json(books)
        }else{
            res.status(404).end()
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Error retrieving books from Elasticsearch')
    }
});

router.get("/isbn/:isbn", async (req, res)=>{
    const isbn = req.params.isbn
    console.log(isbn)
    if (!isbn) {
        return res.status(400).send('ISBN parameter is required');
    }

    try{
        const {body} = await client.search({
            index: 'books',
            type: '_doc', // uncomment this line if you are using {es} ≤ 6
            body: {
                query: {
                match: { ISBN: isbn }
                }
            }
        })

        const books = body.hits.hits.map(hit => hit._source);
        if (books.length > 0){
            return res.status(200).json(books)
        }else{
            res.status(404).end()
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Error retrieving books from Elasticsearch')
    }  
})

router.get('/related-books/:isbn', (req, res) => {
    const isbn = req.params.isbn
    console.log(isbn)
    try{
        makeRequest(isbn).then(
            (data)=> {
                console.log(data)
                if (data.length === 0){
                    return res.status(204).end()
                }else{
                    return res.status(200).json(data)
                }
            }
        ).catch(
            (error)=>{
                console.error('Error:', error);
                if (error.status === 504){
                    return res.status(504).json('circuit open!')
                } else if (error.status === 503){
                    return res.status(503).json('its too soon for request!')
                }else{
                    return res.status(500).json(error)
                }
                  
            }
        )
    }catch(error){
        console.log(error)
        return res.status(500).json(error)
    }
    
  });

export default router