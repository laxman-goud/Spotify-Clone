async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text(); 
    let div = document.createElement('div');
    div.innerHTML = response;
    
    let as = div.getElementsByTagName('a');
    
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href); 
        }
    }
    
    return songs;
}

async function main() {
    let songs = await getSongs();
    console.log(songs); 

    let songsUL = document.querySelector('.song-list').getElementsByTagName('ul')[0];
    for(const song of songs){
        let songName = song.split('/');
        songsUL.innerHTML += `<li>
                                <img src="img/music.svg" alt="music" class="
                                invert">
                                <div class="music-info">
                                    <div class="song-name">${songName[songName.length-1].replace('.mp3','')}</div>
                                    <div class="song-artist">song artist</div>
                                </div>
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="play" class="invert">
                            </li>`
    }
}

main();
