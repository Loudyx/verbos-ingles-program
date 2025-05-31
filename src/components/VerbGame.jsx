import React, { useState } from 'react';
import { Button, Col, Row, Form, Container } from 'react-bootstrap';
import { getAllData } from '../functions/dataReader';
import './VerbGame.css'

const DIFFICULTY = {
  easy: 1,
  medium: 2,
  hard: 3,
  extreme: 3
};

const verbsData = getAllData();

// Utilidades para el localStorage
const STORAGE_KEY = 'verb_probabilities';

//#region Mehtods
const getRandomIndexes = (total, count) => {
  const indexes = new Set();
  while (indexes.size < count) {
    indexes.add(Math.floor(Math.random() * total));
  }
  return Array.from(indexes);
};


const prepareGameData = (difficulty) => {
  const probabilities = loadProbabilities();

  // Shuffle los verbos para randomizar
  const shuffledVerbs = [...verbsData].sort(() => Math.random() - 0.5);

  const selectedVerbs = [];
  
  for (let i = 0; i < shuffledVerbs.length && selectedVerbs.length < 15; i++) {
    const candidate = shuffledVerbs[i];
    const key = candidate.spanish;
    const prob = probabilities[key]?.ignoreProbability || 0;

    // Si pasa la probabilidad o se está quedando sin opciones, se añade
    if (Math.random() > prob || shuffledVerbs.length - i <= 15 - selectedVerbs.length) {
      selectedVerbs.push(candidate);
    }
  }

  // Si por alguna razón no se completan los 15, rellenar sin condiciones
  if (selectedVerbs.length < 15) {
    const remaining = verbsData.filter(v => !selectedVerbs.some(sv => sv.spanish === v.spanish));
    selectedVerbs.push(...remaining.slice(0, 15 - selectedVerbs.length));
  }

  return selectedVerbs.map((verb) => {
    const fields = difficulty === 'extreme'
      ? ['spanish', 'base', 'past', 'participle']
      : ['base', 'past', 'participle'];

    if (difficulty === 'extreme') fields.push('spanish');

    const hideCount = DIFFICULTY[difficulty];
    const hideFields = getRandomIndexes(fields.length, hideCount).map(i => fields[i]);

    return {
      ...verb,
      hidden: hideFields,
      answers: {},
      status: {},
      checked: false
    };
  });
};




const loadProbabilities = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const saveProbabilities = (probabilities) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(probabilities));
};

// Función para actualizar probabilidad según resultados
const updateProbability = (verbKey, result, currentProbabilities) => {
  const currentProb = currentProbabilities[verbKey]?.ignoreProbability || 0.15;
  let newProb = currentProb;

  if (result === 'perfect') {
    newProb = Math.min(currentProb + 0.2, 0.95);
  } else if (result === 'partial') {
    newProb = Math.min(currentProb + 0.1, 0.95);
  } else if (result === 'wrong') {
    newProb = Math.max(currentProb - 0.2, 0);
  } else if (result === 'unchecked') {
    newProb = 0.15; // default
  }

  return {
    ...currentProbabilities,
    [verbKey]: { ignoreProbability: newProb }
  };
};

//#region Component
export const VerbGame = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [gameData, setGameData] = useState([]);
  const [score, setScore] = useState(0);

  const handleStart = (level) => {
    setDifficulty(level);
    setGameData(prepareGameData(level));
    setScore(0);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...gameData];
    updated[index].answers[field] = value;
    setGameData(updated);
  };

  const checkRow = (index) => {
    const row = gameData[index];
    let localScore = 0;
    const newStatus = {};
    row.hidden.forEach((field) => {
      const userAnswer = (row.answers[field] || '').trim().toLowerCase();
      const correct = row[field].toLowerCase();
      if (userAnswer === correct) {
        newStatus[field] = 'correct';
        localScore += 1;
      } else {
        newStatus[field] = 'wrong';
      }
    });

    const updated = [...gameData];
    updated[index].status = newStatus;
    updated[index].checked = true;
    setGameData(updated);
    setScore(score + localScore);
		const key = row.spanish;
		let result = 'wrong';
		const correctCount = Object.values(newStatus).filter((s) => s === 'correct').length;
		if (correctCount === row.hidden.length) result = 'perfect';
		else if (correctCount > 0) result = 'partial';
		else if (correctCount === 0 && Object.values(row.answers).length === 0) result = 'unchecked';

		const updatedProbs = updateProbability(key, result, loadProbabilities());
		saveProbabilities(updatedProbs);
  };

  const checkAll = () => {
    gameData.forEach((row, index) => {
      if (!row.checked && Object.keys(row.answers).length > 0) {
        checkRow(index);
      }
    });
  };

  const handleReroll = () => {
    setGameData(prepareGameData(difficulty));
  };

  const handleRestart = () => {
    setDifficulty(null);
    setGameData([]);
    setScore(0);
  };

	//#region Render
  return (
		<React.Fragment>

			<div className='bgTitle_verbGame'>
				<h1 className='ms-3 mb-2 mt-2'>Verb Practice Game</h1>
			</div>

			<Container>
				{!difficulty && (
					<div className="mb-4">
						<h4 className='text-center mt-2'>Choose Difficulty</h4>
							<div className='d-flex justify-content-center'>
							<Button className="me-2" onClick={() => handleStart('easy')}>Easy</Button>
							<Button className="me-2" onClick={() => handleStart('medium')}>Medium</Button>
							<Button className="me-2" onClick={() => handleStart('hard')}>Hard</Button>
							<Button variant="danger" onClick={() => handleStart('extreme')}>Extreme</Button>
							</div>
					</div>
				)}

				{difficulty && (
					<>
						<Row className="fw-bold border-bottom pb-2 mb-2 mt-3">
							<Col className="d-none d-md-block" md={3}>Spanish</Col>
							<Col className="d-none d-md-block" md={2}>Base</Col>
							<Col className="d-none d-md-block" md={2}>Past</Col>
							<Col className="d-none d-md-block" md={2}>Participle</Col>
							<Col className="d-none d-md-block" md={2}><Button onClick={checkAll}>Check All</Button></Col>
						</Row>

						{gameData.map((verb, index) => (
							<React.Fragment key={index}>
								{/* VISTA DE ESCRITORIO (md+) */}
								<Row className="align-items-center mb-2 d-none d-md-flex">
								<Col md={3}>
									{verb.hidden.includes('spanish') && difficulty === 'extreme' ? (
										<>
											<Form.Control
												type="text"
												disabled={verb.checked}
												value={verb.answers['spanish'] || ''}
												onChange={(e) => handleInputChange(index, 'spanish', e.target.value)}
											/>
											{verb.checked && (
												<div className={`mt-1 small ${
													verb.status['spanish'] === 'correct' ? 'text-success' : 'text-danger'
												}`}>
													{verb.status['spanish'] === 'correct'
														? 'Correct!'
														: `Correct: ${verb.spanish}`}
												</div>
											)}
										</>
									) : (
										verb.spanish
									)}
								</Col>


									{['base', 'past', 'participle'].map((field, i) => (
										<Col md={2} key={i}>
											{verb.hidden.includes(field) ? (
												<>
													<Form.Control
														type="text"
														disabled={verb.checked}
														value={verb.answers[field] || ''}
														onChange={(e) => handleInputChange(index, field, e.target.value)}
													/>
													{verb.checked && (
														<div
															className={`mt-1 small ${
																verb.status[field] === 'correct' ? 'text-success' : 'text-danger'
															}`}
														>
															{verb.status[field] === 'correct'
																? 'Correct!'
																: `Correct: ${verb[field]}`}
														</div>
													)}
												</>
											) : (
												<span>{verb[field]}</span>
											)}
										</Col>
									))}

									<Col md={2}>
										<Button onClick={() => checkRow(index)} disabled={verb.checked}>
											Check
										</Button>
									</Col>
								</Row>

								{/* VISTA MÓVIL (xs, sm) */}
								<div className="d-block d-md-none border rounded p-3 mb-3 shadow-sm bg-light">
								<Row className="mb-2">
									<Col xs={3}><strong>Spanish:</strong></Col>
									<Col xs={9}>
										{verb.hidden.includes('spanish') ? (
											<>
												<Form.Control
													type="text"
													disabled={verb.checked}
													value={verb.answers['spanish'] || ''}
													onChange={(e) => handleInputChange(index, 'spanish', e.target.value)}
													size="sm"
												/>
												{verb.checked && (
													<div className={`mt-1 small ${
														verb.status['spanish'] === 'correct' ? 'text-success' : 'text-danger'
													}`}>
														{verb.status['spanish'] === 'correct'
															? 'Correct!'
															: `Correct: ${verb.spanish}`}
													</div>
												)}
											</>
										) : (
											<span>{verb.spanish}</span>
										)}
									</Col>
								</Row>

									{['base', 'past', 'participle'].map((field, i) => (
										<Row className="mb-2" key={i}>
											<Col xs={3}>
												<strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
											</Col>
											<Col xs={9}>
												{verb.hidden.includes(field) ? (
													<>
														<Form.Control
															type="text"
															disabled={verb.checked}
															value={verb.answers[field] || ''}
															onChange={(e) => handleInputChange(index, field, e.target.value)}
															size="sm"
														/>
														{verb.checked && (
															<div
																className={`mt-1 small ${
																	verb.status[field] === 'correct' ? 'text-success' : 'text-danger'
																}`}
															>
																{verb.status[field] === 'correct'
																	? 'Correct!'
																	: `Correct: ${verb[field]}`}
															</div>
														)}
													</>
												) : (
													<span className='ms-1'>{verb[field]}</span>
												)}
											</Col>
										</Row>
									))}

									<div className="mt-3">
										<Button 
											size="sm" 
											onClick={() => checkRow(index)} 
											disabled={verb.checked} 
											className="w-100"
										>
											Check
										</Button>
									</div>


								</div>

							</React.Fragment>
						))}

						<div className="d-block d-md-none border rounded p-3 mb-3 shadow-sm bg-light">
							<Button 
								size="sm" 
								onClick={checkAll} 
								className="w-100 bg-success"
							>
								Check All
							</Button>
						</div>

						<div className="mt-4 mb-2">
							<h5>Score: {score}</h5>
							<Button className="me-2" onClick={handleReroll}>Re-roll</Button>
							<Button variant="secondary" onClick={handleRestart}>Restart Diff</Button>
						</div>
					</>
				)}
			</Container>
		</React.Fragment>
  );
};
