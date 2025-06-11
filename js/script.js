let audio = new Audio();
let playPause = document.querySelector('.play');
let mainPlayEl = document.querySelector('.play')

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

    let songsUL = document.querySelector('.song-list ul');
    if (!songsUL) {
        console.error("song-list or ul not found in DOM");
        return;
    }

    songs.forEach(song => {
        let SongFullName = decodeURIComponent(song.split('/').pop()).replace('.mp3', '');
        let [songName, songArtist] = SongFullName.split('-');

        songsUL.innerHTML += `
            <li>
                <img src="img/music.svg" alt="music" class="invert">
                <div class="music-info">
                    <div class="song-name">${songName || 'Unknown'}</div>
                    <div class="song-artist">${songArtist || 'Unknown'}</div>
                </div>
                <span>Play Now</span>
                <img src="img/play.svg" alt="play" class="invert play">
            </li>`;
    });

    document.querySelectorAll('.play').forEach(element => {
        element.addEventListener('click', () => {
            playPause.src = 'img/play.svg';
            mainPlayEl.src = 'img/play.svg';
            audio.pause();
            const songName = element.parentElement.querySelector('.song-name').innerText.trim();
            const songArtist = element.parentElement.querySelector('.song-artist').innerText.trim();
            playPause = element;
            playSong(`${songName} - ${songArtist}`);
        });
    });
} 

main();

function playSong(songFileName) {
    const songUrl = `http://127.0.0.1:5500/songs/${encodeURIComponent(songFileName)}.mp3`;
    console.log("Playing:", songUrl);
    audio = new Audio(songUrl);
    playPause.src = 'img/pause.svg';
    mainPlayEl.src = 'img/pause.svg';
    audio.play();
}
