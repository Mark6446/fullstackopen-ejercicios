const Header = ({ course }) => <h2>{course}</h2>

const Total = ({ sum }) => (
  <p><strong>total of {sum} exercises</strong></p>
)

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Content = ({ parts }) => (
  <>
    {parts.map(part => 
      <Part key={part.id} part={part} />
    )}
  </>
)

const Course = ({ course }) => {
  // Uso de reduce para sumar los ejercicios (Ejercicio 2.3)
  const totalExercises = course.parts.reduce((sum, part) => sum + part.exercises, 0)

  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total sum={totalExercises} />
    </div>
  )
}

export default Course