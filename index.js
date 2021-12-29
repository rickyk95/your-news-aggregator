const axios = require('axios')
const cheerio = require('cheerio')
const { children } = require('cheerio/lib/api/traversing')
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
const port = process.env.PORT || 3000;
app.use(express.static(__dirname))
app.listen(port, () => {
        console.log(`Listening on port ${port}`)
})
app.set('view engine', 'handlebars')
app.engine('handlebars', engine())
app.set('views', __dirname)
app.get('/', async (req, res) => {
        res.render('index', { layout: false, articles: "" })
})

app.get('/vox', async (req, res) => {
        const articlesWithImages = []
        const articlesWithoutImages = []
        const response = await axios.get('https://www.vox.com')
        const $ = cheerio.load(response.data)
        $('h2.c-entry-box--compact__title').each((index, element) => {
                let article = {}
                article['title'] = $(element).text()
                article['link'] = $(element).children().attr('href')
                let img = $(element).parent().prev().first().children().find('img').attr('src')

                if(img !== undefined && !img.includes('data')){ 
                        article['img'] = img
                        return articlesWithImages.push(article)
                        
                }else{
                        articlesWithoutImages.push(article)
                }

        })

        res.json([articlesWithImages,articlesWithoutImages])
}
)


app.get('/aj', async (req, res) => {
        const response = await axios.get('https://www.aljazeera.com')
        const $ = cheerio.load(response.data)
        // const articlesDOM = $('.u-clickable-card__link')
        const articlesDOM = $('article')
        const articles = []
        const articlesWithImages = []
        const articlesWithoutImages = []
        const clickableLinks = articlesDOM.each((index,article)=>{
                let title = $(article).find('.u-clickable-card__link')
                title = title.text()
                let link =  $(article).find('.u-clickable-card__link')
                link = 'https://www.aljazeera.com' + $(link).attr('href')
                let img = $(article).find('.responsive-image img')
                img = $(img).attr('src') !== undefined ? img = 'https://www.aljazeera.com' + $(img).attr('src') : '';
                if(!img){
                     return articlesWithoutImages.push({title,link})
                }
                articlesWithImages.push({title,link,img})
        })

        res.json([articlesWithImages,articlesWithoutImages])
}
)