let playPauseBtn = document.querySelector('.play-pause');
let mainPlayEl = document.querySelector('.play-pause');

let songsList = [];
let curSongIndex = 0;
let audio = new Audio();

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;

    let links = div.getElementsByTagName('a');
    let songs = [];
    for (let link of links) {
        if (link.href.endsWith('.mp3')) {
            songs.push(link.href);
        }
    }
    return songs;
}

async function main() {
    songsList = await getSongs();
    if (!songsList.length) return;

    loadSong(curSongIndex);

    // Populate song list
    let songsUL = document.querySelector('.song-list ul');
    if (!songsUL) {
        console.error("song-list or ul not found in DOM");
        return;
    }

    songsList.forEach(songUrl => {
        let decoded = decodeURIComponent(songUrl.split('/').pop().replace('.mp3', ''));
        let [name, artist] = decoded.split(' - ');
        songsUL.innerHTML += `
            <li>
                <img src="img/music.svg" alt="music" class="invert">
                <div class="music-info">
                    <div class="song-name">${name || 'Unknown'}</div>
                    <div class="song-artist">${artist || 'Unknown'}</div>
                </div>
                <span>Play Now</span>
                <img src="img/play.svg" alt="play" class="invert play cursor-pointer">
            </li>`;
    });

    let prevBtn = null;

    document.querySelectorAll('.play').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (curSongIndex === index && !audio.paused) {
                audio.pause();
                btn.src = 'img/play.svg';
                updatePlayPauseUI(true);
            } else {
                if (prevBtn && prevBtn !== btn) {
                    prevBtn.src = 'img/play.svg';
                }

                curSongIndex = index;
                loadSong(curSongIndex);
                audio.play();
                btn.src = 'img/pause.svg';
                prevBtn = btn;
                updatePlayPauseUI(false);
            }
        });
    });


    let totalDurationFormatted = '';

    audio.addEventListener("loadedmetadata", () => {
        totalDurationFormatted = formatTime(audio.duration);
        const [name, artist] = getSongNameAndArtist(songsList[curSongIndex]);
        updatePlayBar(name, artist, `0:00 / ${totalDurationFormatted}`);
    });

    audio.addEventListener("timeupdate", () => {
        let currentFormatted = formatTime(audio.currentTime);
        document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 99 + '%';
        document.querySelector('.song-duration').innerText = `${currentFormatted} / ${totalDurationFormatted}`;
    });
}

main();

function loadSong(index) {
    audio.src = songsList[index];
    let [name, artist] = getSongNameAndArtist(songsList[index]);
    updatePlayBar(name, artist, "...");
}

function getSongNameAndArtist(songUrl) {
    let decoded = decodeURIComponent(songUrl.split('/').pop().replace('.mp3', ''));
    return decoded.split(' - ');
}

function updatePlayBar(songName, songArtist = '', initialDuration = '...') {
    document.querySelector('.playBar-song-name').innerText = `${songName} - ${songArtist}`;
    document.querySelector('.song-duration').innerText = initialDuration;
}

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

document.querySelector('.seek-bar').addEventListener('click', (e) => {
    const seekWidth = e.target.getBoundingClientRect().width;
    const clickX = e.offsetX;
    const seekRatio = clickX / seekWidth;
    audio.currentTime = audio.duration * seekRatio;
    document.querySelector('.circle').style.left = `${seekRatio * 99}%`;
});

// Play/pause/next/prev control buttons
const songControls = document.querySelector('.song-controls');
songControls.addEventListener('click', (e) => {
    const btn = e.target;

    if (!btn.alt) return;

    switch (btn.alt) {
        case 'play-pause':
            if (audio.paused) {
                audio.play();
                updatePlayPauseUI(false);
            } else {
                audio.pause();
                updatePlayPauseUI(true);
            }
            break;

        case 'prevsong':
            curSongIndex = (curSongIndex - 1 + songsList.length) % songsList.length;
            loadSong(curSongIndex);
            audio.play();
            updatePlayPauseUI(false);
            break;

        case 'nextsong':
            curSongIndex = (curSongIndex + 1) % songsList.length;
            loadSong(curSongIndex);
            audio.play();
            updatePlayPauseUI(false);
            break;
    }
});

function updatePlayPauseUI(paused) {
    const playPauseIcon = paused ? 'img/play.svg' : 'img/pause.svg';
    document.querySelectorAll('img[alt="play-pause"]').forEach(el => el.src = playPauseIcon);
}

// Volume control
document.getElementById('volumeControl').addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

// Hamburger menu
document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0%';
});

document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-110%';
});
