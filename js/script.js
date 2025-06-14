let audio = new Audio();
let playPause = document.querySelector('.play-pause');
let mainPlayEl = document.querySelector('.play-pause');

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
                <img src="img/play.svg" alt="play" class="invert play cursor-pointer">
            </li>`;
    });

    document.querySelectorAll('.play').forEach(element => {
        element.addEventListener('click', () => {
            const songName = element.parentElement.querySelector('.song-name').innerText.trim();
            const songArtist = element.parentElement.querySelector('.song-artist').innerText.trim();
            const fullSongName = `${songName} - ${songArtist}`;

            if (audio.paused || audio.src.indexOf(fullSongName) === -1) {
                playPause = element;
                playSong(fullSongName);
                audio.addEventListener('loadedmetadata', () => {
                    const duration = formatTime(audio.duration);
                    updatePlayBar(songName, songArtist, duration);
                }, { once: true });

                playPause.src = 'img/pause.svg';
                mainPlayEl.src = 'img/pause.svg';
            } else {
                audio.pause();
                playPause.src = 'img/play.svg';
                mainPlayEl.src = 'img/play.svg';
            }
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

function updatePlayBar(songName, songArtist, songDuration) {
    console.log(songName, songArtist, songDuration);
    let playBar_songName = document.querySelector('.playBar-song-name');
    let playBar_songDuration = document.querySelector('.song-duration');
    playBar_songName.innerText = songName + ' - ' + songArtist;
    playBar_songDuration.innerText = songDuration;
    console.log(songDuration);


    audio.addEventListener('timeupdate', () => {
        let progressPercent = (audio.currentTime / audio.duration) * 99;
        document.querySelector('.circle').style.left = progressPercent + '%';
        playBar_songDuration.innerText = formatTime(audio.currentTime) + ' / ' + songDuration;
    });

}

document.querySelector('.seek-bar').addEventListener('click', (e) => {
    const circle = document.querySelector('.circle');
    let curPos = (e.offsetX / e.target.getBoundingClientRect().width) * 99;
    audio.currentTime = (audio.duration * curPos) / 100;
    console.log((audio.duration) * curPos / 100);

    circle.style.left = curPos + '%';

})

songControls = document.querySelector('.song-controls');

songControls.addEventListener('click', (e) => {
    targetBtn = e.target;
    if(targetBtn && !audio.paused) {
        if (targetBtn.alt == 'play-pause'){
            if (audio.paused) {
                audio.play();
                targetBtn.src = 'img/pause.svg';
            } else {
                audio.pause();
                targetBtn.src = 'img/play.svg';
            }
        }
        else if (targetBtn.alt == 'prevsong') {
            console.log('previous song');
        }
        else if (targetBtn.alt == 'nextsong') {
            console.log('next song');
        }
    }
    else {
        console.log('Invalid');
    }
});

const volumeSlider = document.getElementById('volumeControl');

volumeSlider.addEventListener('input', function () {
    audio.volume = volumeSlider.value / 100;
});

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}
