const AnyaImage = [
    'https://i.imgur.com/wuyjO0M.jpg',
    'https://i.imgur.com/oJCAGb5.jpg',
    'https://i.imgur.com/FDT9Yeg.jpg',
    'https://i.imgur.com/1FwssQY.jpg',
    'https://i.imgur.com/i97uQgO.jpg',
    'https://i.imgur.com/4wt5LY9.jpg',
    'https://i.imgur.com/XEuEL9w.jpg',
    'https://i.imgur.com/vWbBfhq.jpg',
    'https://i.imgur.com/PP76ITw.jpg',
    'https://i.imgur.com/MIbS0oV.jpg',
    'https://i.imgur.com/5zxWxnY.jpg'
]
const GetRandomAnyaImage = () => {
    return AnyaImage[Math.floor(Math.random() * AnyaImage.length)]
}

const ImagetoBase64 = async (url) => {
    const gettype = (url) => {
        const suffix = url.split('.').pop()
        switch (suffix) {
            case 'png':
                return 'image/png'
            case 'jpg':
                return 'image/jpeg'
            case 'jpeg':
                return 'image/jpeg'
            case 'gif':
                return 'image/gif'
            case 'bmp':
                return 'image/bmp'
            case 'webp':
                return 'image/webp'
            case 'svg':
                return 'image/svg+xml'
            default:
                return 'image/png'
        }
    }
    return fetch(url).then(response => response.arrayBuffer()).then(buffer => {
        return `data:${gettype(url)};base64,${btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))}`
    })
}
const getstar = async (repo) => {
    const url = `https://api.github.com/repos/${repo}`
    const res = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
            'Authorization': 'token ' + GITHUB_TOKEN || ''
        }
    })
    const json = await res.json()
    return json.stargazers_count
}

const AnyaGnerate = async (config) => {
    config.text = config.text || (!!config.repo ? '☆Star:' + await getstar(config.repo) : null) || '哇酷哇酷！ Anya@CyanFalse'
    config.textlength = config.text.length
    config.fontsize = config.fontsize || 15
    config.border = config.border || 3
    config.size = config.size || 32
    config.chartotalsize = ((t) => {
        let size = 0
        for (e of t) {
            size += e.charCodeAt() > 127 ? 1.84 : 1 //https://github.com/RimoChan/unv-shield/blob/slave/unv_shield/handler.py#L93
        }
        return size
    })(config.text)
    config.barlen = config.fontsize * config.chartotalsize * 0.55 + 2.6 * config.border
    return `
    <svg viewBox='0 0 ${config.barlen + config.size} ${config.size}' width='${config.barlen + config.size}px' height='${config.size}px' xmlns='http://www.w3.org/2000/svg'>
    <foreignObject x='0' y='0' width='${config.barlen + config.size}' height='${config.size}'>
        <html xmlns='http://www.w3.org/1999/xhtml'>
            <style>
                .img {
                     border-radius: 99999px; 
                     background-image: url('${await ImagetoBase64(config.img || GetRandomAnyaImage())}');
                     background-size: cover;
                     position: absolute; 
                     top: ${config.border}px;
                     left: ${config.border}px; 
                     width: ${config.size - 2 * config.border}px; 
                     height: ${config.size - 2 * config.border}px; 
                     box-shadow: 0px 0px ${config.border}px rgba(0,0,0,0.5); 
                } 
                .bar {
                    display: flex;
                    align-items: center;
                    overflow: hidden; 
                    font-family: consolas, SimHei; 
                    position: absolute; 
                    top: ${config.border + config.size * 0.1}px; 
                    left: ${config.size / 2}px; 
                    height: ${(config.size - 2 * config.border) * 0.8}px; 
                    background: linear-gradient(#${config.bgcolor1 || 'ffc8cad9'}, #${config.bgcolor2 || 'dd8b99'}); 
                    box-shadow: 0px 0px ${config.border}px rgba(0,0,0,0.5); 
                    border-radius: 5px; 
                    white-space: nowrap; 
                    padding-left: ${config.size / 2}px; 
                    font-size: ${config.fontsize}px; 
                    color: #${config.color || 'fff'};
                    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.5); 
                } @keyframes move { from { width: 0px;} to { width: ${config.barlen - config.border}px; } } .bar { animation-duration: 0.5s; animation-name: move; animation-fill-mode: both; }
            </style>
            
            <div class='bar'>
                <span>
                    ${config.text}
                </span>
            </div>
            
            <div class='img'></div>
        </html>
    </foreignObject>
</svg>
`}

const WakuWaku = async (req) => {
    const urlObj = new URL(req.url)
    return new Response(await AnyaGnerate({
        repo: urlObj.searchParams.get('repo'),
        text: urlObj.searchParams.get('text'),
        img: urlObj.searchParams.get('img'),
        bgcolor1: urlObj.searchParams.get('bgcolor1'),
        bgcolor2: urlObj.searchParams.get('bgcolor2'),
        color: urlObj.searchParams.get('color'),
        fontsize: urlObj.searchParams.get('fontsize'),
        border: urlObj.searchParams.get('border'),
        size: urlObj.searchParams.get('size')
    }), {
        headers: {
            'Content-Type': 'image/svg+xml',
            "Access-Control-Allow-Origin": "*",
            "cache-control": "max-age=120, s-maxage=120"
        }
    })
}

addEventListener('fetch', event => {
    event.respondWith(WakuWaku(event.request))
})