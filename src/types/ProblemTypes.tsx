type ProblemType = "Analytical" | "Discrete";
type MinOrMax = 1 | -1;

type ProblemInfo = {
  problemId: number;
  problemName: string;
  problemType: ProblemType;
  objectiveNames: string[];
  variableNames: string[];
  nObjectives: number;
  ideal: number[];
  nadir: number[];
  minimize: MinOrMax[];
};

// one objective vector
type ObjectiveDatum = {
  selected: boolean;
  value: number[];
};

type ObjectiveData = {
  values: ObjectiveDatum[];
  names: string[];
  directions: MinOrMax[];
  ideal: number[];
  nadir: number[];
};

type ProblemData = {
  upperBounds: number[][];
  lowerBounds: number[][];
  referencePoints: number[][];
  boundaries: number[][];
  totalSteps: number;
  stepsTaken: number;

};


export type {
  ProblemInfo,
  ProblemType,
  ProblemData,
  MinOrMax,
  ObjectiveData,
  ObjectiveDatum,
};
