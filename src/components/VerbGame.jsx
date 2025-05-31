import React, { useState } from 'react';
import { Button, Col, Row, Form, Container } from 'react-bootstrap';
import verbsData from '../data/same-past-participe.json';
import './VerbGame.css'

const DIFFICULTY = {
  easy: 1,
  medium: 2,
  hard: 3
};

//#region Mehtods
const getRandomIndexes = (total, count) => {
  const indexes = new Set();
  while (indexes.size < count) {
    indexes.add(Math.floor(Math.random() * total));
  }
  return Array.from(indexes);
};

const prepareGameData = (difficulty) => {
  const selectedVerbs = verbsData.sort(() => 0.5 - Math.random()).slice(0, 15);

  return selectedVerbs.map((verb) => {
    const fields = ['base', 'past', 'participle'];
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
								<Button onClick={() => handleStart('hard')}>Hard</Button>
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
							<Col className="d-none d-md-block" md={3} xl={12} ><Button onClick={checkAll}>Check All</Button></Col>
						</Row>

						{gameData.map((verb, index) => (
							<React.Fragment key={index}>
								{/* VISTA DE ESCRITORIO (md+) */}
								<Row className="align-items-center mb-2 d-none d-md-flex">
									<Col md={3}>{verb.spanish}</Col>

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

									<Col md={3}>
										<Button onClick={() => checkRow(index)} disabled={verb.checked}>
											Check
										</Button>
									</Col>
								</Row>

								{/* VISTA MÓVIL (xs, sm) */}
								<div className="d-block d-md-none border rounded p-3 mb-3 shadow-sm bg-light">
									<Row className="mb-2">
										<Col xs={3}><strong>Spanish:</strong></Col>
										<Col xs={9}>{verb.spanish}</Col>
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

						<Col className="d-none d-md-block" md={3} xl={12} ><Button onClick={checkAll}>Check All</Button></Col>
						<Button 
							size="sm" 
							onClick={checkAll} 
							className="w-100 bg-success"
						>
							Check All
						</Button>

						<div className="mt-4 mb-2">
							<h5>Score: {score}</h5>
							<Button className="me-2" onClick={handleReroll}>Re-roll</Button>
							<Button variant="secondary" onClick={handleRestart}>Restart</Button>
						</div>
					</>
				)}
			</Container>
		</React.Fragment>
  );
};
