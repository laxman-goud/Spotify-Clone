// 🔥 Global Variables
let playPauseBtn = document.querySelector('.play-pause');
let mainPlayEl = document.querySelector('.play-pause');

let songsList = [];
let curSongIndex = 0;
let audio = new Audio();

// 🔥 Fetch MP3 files from specified folder
async function getSongs(folder) {
    let a = await fetch(`/songs/${folder}`);
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

// 🔥 Fetch album folders and display cards
async function displayAlbums() {
    let cardContainer = document.querySelector('.card-container');
    if (!cardContainer) {
        // console.error('card-container not found');
        return;
    }

    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;

    let anchors = div.getElementsByTagName('a');

    for (let e of anchors) {
        if (e.href.includes('/songs/') && !e.href.endsWith('.mp3')) {
            let folder = e.href.split('/').slice(-1)[0].replace('/', '');
            try {
                let info = await fetch(`/songs/${folder}/info.json`);
                let responseInfo = await info.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card cursor-pointer">
                        <div class="play-button">
                            <img src="img/play.svg" alt="Play album">
                        </div>
                        <img src="${responseInfo.cover}" alt="${responseInfo.title} cover">
                        <h3>${responseInfo.title}</h3>
                        <p>${responseInfo.description}</p>
                    </div>`;
            } catch (err) {
                // console.warn(`Skipping ${folder}, info.json missing or invalid`);
            }
        }
    }

    AlbumsListeners();
}

// 🔥 Add click listeners for each album card
async function AlbumsListeners() {
    let cards = document.querySelectorAll('.card');
    Array.from(cards).forEach(card => {
        card.addEventListener('click', async () => {
            songsList = await getSongs(`${card.dataset.folder}`);

            let songsUL = document.querySelector('.song-list ul');
            songsUL.innerHTML = '';

            if (!songsUL) {
                // console.error("song-list or ul not found in DOM");
                return;
            }

            for (const songUrl of songsList) {
                const decoded = decodeURIComponent(songUrl.split('/').pop().replace('.mp3', ''));
                const [name, artist] = decoded.split('-');

                songsUL.innerHTML += `
                <li >
                    <img src="img/music.svg" alt="Music icon" class="invert">
                    <div class="music-info">
                        <div class="song-name">${name || 'Unknown'}</div>
                        <div class="song-artist">${artist || 'Unknown'}</div>
                    </div>
                    <span>Play Now</span>
                    <img src="img/play.svg" alt="Play song" class="invert play cursor-pointer">
                </li>`;
            }

            document.querySelector('.left').style.left = '0%';
            loadSong(curSongIndex);
            audio.play();
            updatePlayPauseUI(false);
            attachSongPlayListeners();
        })
    });
}

// 🔥 Attach listeners to each play button next to songs
function attachSongPlayListeners() {
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
}

// 🔥 Main entry point
async function main() {
    songsList = await getSongs('cs');
    if (!songsList.length) return;

    loadSong(curSongIndex);
    await displayAlbums();
    attachSongPlayListeners();

    let totalDurationFormatted = '';

    audio.addEventListener("loadedmetadata", () => {
        totalDurationFormatted = formatTime(audio.duration);
        const [name, artist] = getSongNameAndArtist(songsList[curSongIndex]);
        updatePlayBar(name, artist, `0:00 / ${totalDurationFormatted}`);
    });

    audio.addEventListener("timeupdate", () => {
        let currentFormatted = formatTime(audio.currentTime);
        document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 99 + '%';
        document.querySelector('.song-duration').innerText = `${currentFormatted} / ${formatTime(audio.duration)}`;
    });
}

main();

// 🔥 Load song and update UI
function loadSong(index) {
    audio.src = songsList[index];
    let [name, artist] = getSongNameAndArtist(songsList[index]);
    updatePlayBar(name, artist, '...');
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

// 🔥 Seekbar

// Jump song position on seek bar click
document.querySelector('.seek-bar').addEventListener('click', (e) => {
    const seekWidth = e.target.getBoundingClientRect().width;
    const clickX = e.offsetX;
    const seekRatio = clickX / seekWidth;
    audio.currentTime = audio.duration * seekRatio;
    document.querySelector('.circle').style.left = `${seekRatio * 99}%`;
});

// 🔥 Playback Controls (play, prev, next)
const songControls = document.querySelector('.song-controls');
songControls.addEventListener('click', (e) => {
    const btn = e.target;

    if (!btn.alt) return;

    switch (btn.alt) {
        case 'Play/Pause':
            if (audio.paused) {
                audio.play();
                updatePlayPauseUI(false);
            } else {
                audio.pause();
                updatePlayPauseUI(true);
            }
            break;

        case 'Previous song':
            curSongIndex = (curSongIndex - 1 + songsList.length) % songsList.length;
            loadSong(curSongIndex);
            audio.play();
            updatePlayPauseUI(false);
            break;

        case '':
            curSongIndex = (curSongIndex + 1) % songsList.length;
            loadSong(curSongIndex);
            audio.play();
            updatePlayPauseUI(false);
            break;
    }
});

// 🔥 Play/pause button UI sync
function updatePlayPauseUI(paused) {
    const playPauseIcon = paused ? 'img/play.svg' : 'img/pause.svg';
    document.querySelectorAll('img[alt="Play/Pause"]').forEach(el => el.src = playPauseIcon);
}

// 🔥 Volume Control
const volume = document.querySelector('.volume');
const volumeSlider = document.getElementById('volumeControl');

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    volume.src = 'img/volume.svg';
    audio.muted = false;
});

volume.addEventListener('click', () => {
    if (volume.src.includes('volume.svg')) {
        volume.src = 'img/mute.svg';
        audio.muted = true;
    } else {
        volume.src = 'img/volume.svg';
        audio.muted = false;
    }
});

// 🔥 Hamburger Menu

document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0%';
});

document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-110%';
});