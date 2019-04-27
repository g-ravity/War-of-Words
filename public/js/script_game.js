const gameController = (()=>{
    let selfTotal = 0;
    let opponentTotal = 0;
    const winningTotal = 50;
    const wordList = [];

    return{
        getTotals: function(){
            return{
                selfTotal: selfTotal,
                opponentTotal: opponentTotal,
            }
        },
        updateSelfTotal: (point)=>{
            selfTotal+=point;
        },
        updateOpponentTotal: (point)=>{
            opponentTotal+=point;
        },
        updateWordList: (word)=>{
            wordList.push(word);
        },
        checkWordList: (word)=>{
            let hasWord;
            wordList.forEach(el=>{
                if(el===word)
                    hasWord= true;
            });
            return hasWord;
        },
        checkLastLetter: ()=>{
            if(wordList.length===0)
                return null;
            return wordList[wordList.length-1].substr(-1);
        },
        checkGameResult: function(){
            if(selfTotal>=winningTotal){
                return{
                    gameOver:true,
                    winner:'self'
                }
            }
            else if(opponentTotal>=winningTotal){
                return{
                    gameOver:true,
                    winner:'opponent'
                }
            }
            else
                return {gameOver:false}
        },
        resetGame: ()=>{
            selfTotal=0;
            opponentTotal=0;
            // CLearing all the words in the wordList
            wordList.splice(0,wordList.length);
        }
    }
})();

const UIController = (()=>{
    const DOMStrings= {
        wordInput: '#word_input',
        selfWords: '#player_self .words',
        selfPoints: '#player_self .points',
        opponentWords: '#player_opponent .words',
        opponentPoints: '#player_opponent .points',
        selfTotal: '#player_self .total_score',
        opponentTotal: '#player_opponent .total_score',
        typing: '#player_opponent #typing',
        loader: '.lds-ellipsis',
        flashMessage: '#flash_message',
        flashHeader: '#flash_message #flash_header',
        flashContent: '#flash_message #flash_content',
        opponentPlayer: '#player_opponent',
        selfPlayer: '#player_self'
    }

    const loader = document.querySelector(DOMStrings.loader);
    const wordInput = document.querySelector(DOMStrings.wordInput);
    const typing = document.querySelector(DOMStrings.typing);
    const selfWords = document.querySelector(DOMStrings.selfWords);
    const opponentWords = document.querySelector(DOMStrings.opponentWords);
    const selfPoints = document.querySelector(DOMStrings.selfPoints);
    const opponentPoints = document.querySelector(DOMStrings.opponentPoints);
    const selfTotal = document.querySelector(DOMStrings.selfTotal);
    const opponentTotal = document.querySelector(DOMStrings.opponentTotal);
    const flashMessage = document.querySelector(DOMStrings.flashMessage);
    const flashHeader = document.querySelector(DOMStrings.flashHeader);
    const flashContent = document.querySelector(DOMStrings.flashContent);
    const opponentPlayer = document.querySelector(DOMStrings.opponentPlayer);
    const selfPlayer = document.querySelector(DOMStrings.selfPlayer);

    return {
        DOMStrings: DOMStrings,
        displayLoader: ()=>{
            // Displaying the loader before the HTTP request
            loader.style.display='inline-block';
        },
        hideLoader: ()=>{
            // Hiding the loader when the request is complete
            loader.style.display='none';
        },
        updateDashboard: (element, word, point)=>{
            if(element==='self'){
                (selfWords.children[0]).insertAdjacentHTML('afterend', `<p>${word}</p>`);
                (selfPoints.children[0]).insertAdjacentHTML('afterend', `<p>${point}</p>`);
            }
            else{
                (opponentWords.children[0]).insertAdjacentHTML('afterend', `<p>${word}</p>`);
                (opponentPoints.children[0]).insertAdjacentHTML('afterend', `<p>${point}</p>`);
            }
        },
        clearInput: ()=>{
            wordInput.value = "";
            wordInput.blur();
        },
        showTyping: ()=>{
            typing.style.opacity='1';
        },
        hideTyping: ()=>{
            typing.style.opacity='0';
        },
        displayTotal: (element, totalPoint)=>{
            if(element==='self')
                selfTotal.children[0].innerText = `TOTAL : ${totalPoint}`;
            else
                opponentTotal.children[0].innerText = `TOTAL : ${totalPoint}`;
        },
        showErrorMessage: function(errorMessage){
            flashMessage.style.display = 'block';
            flashMessage.style.background = '#ff4949';
            flashHeader.innerText = 'OOPS!';
            flashContent.innerText = errorMessage;
            flashMessage.style.opacity = '1';
            flashMessage.style.transition = 'opacity .2s';
            setTimeout(this.closeFlashMessage, 2500);
        },
        showSuccessMessage: function(successMessage){
            flashMessage.style.display = 'block';
            flashMessage.style.background = '#7aff42';
            flashHeader.innerText = 'CONGRATULATIONS!';
            flashContent.innerText = successMessage;
            flashMessage.style.opacity = '1';
            flashMessage.style.transition = 'opacity .2s';
            setTimeout(this.closeFlashMessage, 2500);
        },
        closeFlashMessage: ()=>{
            flashMessage.style.opacity = '0';
            flashMessage.style.transition = 'opacity .2s';
            setTimeout(()=>{flashMessage.style.display='none';}, 300);
        },
        disableWordInput: ()=>{
            wordInput.readOnly = true;
        },
        enableWordInput: ()=>{
            wordInput.readOnly = false;
        },
        selfTurn: function(){
            selfPlayer.style.opacity='1';
            opponentPlayer.style.opacity='0.4';
            this.enableWordInput();
        },
        opponentTurn: ()=>{
            selfPlayer.style.opacity = '0.6';
            opponentPlayer.style.opacity='1';
        },
        resetGameDisplay: function(){
            selfPlayer.style.opacity = '0.6';
            opponentPlayer.style.opacity='0.4';
            this.clearInput();
            setTimeout(()=>{
                selfTotal.children[0].innerText = `TOTAL : 0`;
                opponentTotal.children[0].innerText = `TOTAL : 0`;
                selfWords.innerHTML='<h2>WORDS</h2>';
                selfPoints.innerHTML='<h2>POINTS</h2>';
                opponentWords.innerHTML='<h2>WORDS</h2>';
                opponentPoints.innerHTML='<h2>POINTS</h2>';
            }, 3000);
        }
    }
})();

const appController = ((gameCtrl, UICtrl)=>{
    const DOMObj = UICtrl.DOMStrings;

    let isTyping;
    let socket;
    const wordInput = document.querySelector(DOMObj.wordInput);

    const setUpEventListeners = ()=>{
        document.addEventListener('keypress', async (e)=>{
            clearTimeout(isTyping);
            // User hits Enter
            if(e.keyCode===13 && e.target.id==='word_input'){
                // CLear typing message when user hits Enter
                socket.emit('typingStopped');
                // Converting the word to Lower Case
                wordInput.value = wordInput.value.toLowerCase();
                // Specifying extra parameters for the HTTP Request
                const params={
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "word": wordInput.value
                    }),
                    method: 'POST'
                };
                // Display the loader before HTTP request
                UICtrl.displayLoader();
                const data = await fetch('/verify', params);
                // Remove the loader when HTTP request is completed
                UICtrl.hideLoader();
                if(data.status===200){
                    // Check if the entered word starts with the previous letter
                    if( !gameCtrl.checkLastLetter() ? true :  wordInput.value.substr(0,1)===gameCtrl.checkLastLetter() ){
                        // Check if the word has been entered before
                        if(!gameCtrl.checkWordList(wordInput.value)){
                            // If not entered, add word to the list
                            gameCtrl.updateWordList(wordInput.value);
                            socket.emit('wordPlayed', {
                                word: wordInput.value,
                                point: wordInput.value.length,
                            });
                            // Updating the player dashboard
                            UICtrl.updateDashboard('self', wordInput.value, wordInput.value.length);
                            // Update the score of the player
                            gameCtrl.updateSelfTotal(wordInput.value.length);
                            showTotalScores();
                            // Clear the input field
                            UICtrl.clearInput();
                            UICtrl.disableWordInput();
                            setTimeout(()=>{
                                // Check if the game is over or not
                                if(gameCtrl.checkGameResult().gameOver){
                                    UICtrl.showSuccessMessage('YOU WON');
                                    // Resetting everything
                                    resetGame();
                                    setTimeout(()=>{ UICtrl.opponentTurn() }, 3200);
                                }
                                else
                                    socket.emit('activeTurn', socket.id);
                            }, 800);
                        }
                        else
                            UICtrl.showErrorMessage('WORD ALREADY ENTERED');
                    }
                    else
                        UICtrl.showErrorMessage(`WORD MUST BEGIN WITH '${gameCtrl.checkLastLetter().toUpperCase()}'`);
                }
                else{
                    const errorMessage = await data.text();
                    UICtrl.showErrorMessage(errorMessage);
                }
            }
            // User presses any other Key
            else if(e.keyCode!==13 && e.target.id==='word_input')
                socket.emit('typing');
        });

        document.addEventListener('keyup', e=>{
            if(e.keyCode!==13 && e.target.id==='word_input'){
                isTyping = setTimeout(()=>{ socket.emit('typingStopped'); }, 700);
            }
        });

        socket.on('playedWord', wordInfo=>{
            // Add opponent's word to the list
            gameCtrl.updateWordList(wordInfo.word);
            // Updating the dashboard
            UICtrl.updateDashboard('opponent', wordInfo.word, wordInfo.point);
            // Hide typing message when opponent has entered the word
            UICtrl.hideTyping();
            // Update the score
            gameCtrl.updateOpponentTotal(wordInfo.point);
            showTotalScores();
            setTimeout(()=>{
                // Check if game is over or not
                if(gameCtrl.checkGameResult().gameOver){
                    UICtrl.showErrorMessage('OPPONENT WON');
                    // Resetting everything
                    resetGame();
                    setTimeout(()=>{ UICtrl.selfTurn() }, 3200);
                }
            }, 800);
        });

        socket.on('typing', ()=>{
            UICtrl.showTyping();
        });

        socket.on('typingStopped', ()=>{
            UICtrl.hideTyping();
        });

        socket.on('activeTurn', (turnID)=>{
            if(socket.id===turnID)
                UICtrl.selfTurn();
            else
                UICtrl.opponentTurn();
        });

        socket.on('disconnected', ()=>{
            UICtrl.showErrorMessage('OPPONENT DISCONNECTED');
            resetGame();
        });

        const resetGame = ()=>{
            UICtrl.resetGameDisplay();
            gameCtrl.resetGame();
        }
    };

    const showTotalScores = ()=>{
        const totals = gameCtrl.getTotals();
        UICtrl.displayTotal('self', totals.selfTotal);
        UICtrl.displayTotal('opponent', totals.opponentTotal);
    }

    return {
        init: ()=>{
            console.log('Application has started!');
            // PRODUCTION
            socket = io.connect('https://war-of-words.herokuapp.com/', {query: `roomID= ${window.location.href.substr(-6)}`});
            // DEVELOPMENT
            // socket = io.connect('http://localhost:3000', {query: `roomID= ${window.location.href.substr(-6)}`});
            socket.emit('newGameTurn');
            setUpEventListeners();
            // Show the initial scores
            showTotalScores();
            UICtrl.disableWordInput();
        }
    }
})(gameController, UIController);

window.onload = appController.init();