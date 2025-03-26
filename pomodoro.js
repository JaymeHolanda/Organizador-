class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutos em segundos
        this.breakTime = 5 * 60; // 5 minutos em segundos
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isWorkTime = true;
        this.timer = null;

        // Elementos do DOM
        this.timerDisplay = document.getElementById('timer');
        this.startButton = document.getElementById('startPomodoro');
        this.resetButton = document.getElementById('resetPomodoro');
        this.statusDisplay = document.querySelector('.pomodoro-status');
        this.timerSound = document.getElementById('timerSound');
        this.progressRing = document.querySelector('.progress-ring__circle-progress');

        // Configurar o círculo de progresso
        const circumference = 2 * Math.PI * 90; // 2πr, onde r = 90
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = 0;
        this.circumference = circumference;

        // Configurar o som
        this.setupSound();

        // Event listeners
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());

        // Inicializa o display
        this.updateDisplay();
    }

    setupSound() {
        // Garantir que o som está carregado
        this.timerSound.load();
        
        // Adicionar tratamento de erro para o som
        this.timerSound.onerror = (e) => {
            console.error('Erro ao carregar o som:', e);
        };

        // Configurar o som para tocar mesmo se já estiver tocando
        this.timerSound.onended = () => {
            this.timerSound.currentTime = 0;
        };
    }

    playSound() {
        try {
            // Parar o som se estiver tocando
            this.timerSound.pause();
            this.timerSound.currentTime = 0;
            
            // Tocar o som com uma Promise para melhor tratamento de erro
            const playPromise = this.timerSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Erro ao tocar o som:', error);
                });
            }
        } catch (error) {
            console.error('Erro ao manipular o som:', error);
        }
    }

    stopSound() {
        try {
            this.timerSound.pause();
            this.timerSound.currentTime = 0;
        } catch (error) {
            console.error('Erro ao parar o som:', error);
        }
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
            this.startButton.textContent = 'Continuar';
            this.stopSound();
        } else {
            this.startTimer();
            this.startButton.textContent = 'Pausar';
            this.playSound();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();

            if (this.timeLeft <= 0) {
                this.switchMode();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timer);
    }

    resetTimer() {
        this.pauseTimer();
        this.stopSound();
        this.timeLeft = this.isWorkTime ? this.workTime : this.breakTime;
        this.startButton.textContent = 'Iniciar';
        this.updateDisplay();
        this.updateProgress();
    }

    switchMode() {
        this.isWorkTime = !this.isWorkTime;
        this.timeLeft = this.isWorkTime ? this.workTime : this.breakTime;
        this.statusDisplay.textContent = this.isWorkTime ? 'Trabalho' : 'Pausa';
        this.pauseTimer();
        this.startButton.textContent = 'Iniciar';
        this.updateDisplay();
        this.updateProgress();
        this.notifyUser();
        this.playSound();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const totalTime = this.isWorkTime ? this.workTime : this.breakTime;
        const progress = this.timeLeft / totalTime;
        const offset = this.circumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }

    notifyUser() {
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: this.isWorkTime ? 'Hora de trabalhar!' : 'Hora da pausa!',
                icon: '/favicon.ico'
            });
        }
    }
}

// Solicita permissão para notificações
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    // Inicializa o Pomodoro
    new PomodoroTimer();
});