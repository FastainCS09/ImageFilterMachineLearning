import Dropzone from '@/client/components/Dropzone'

const Homepage = () => {
  return (
    <section className='section'>
        <div className='container'>
            <h1 className='title text-3xl font-bold'
                style={{backgroundColor: 'rgba(0,255,208,255)', color: 'black', display: 'inline'}}>Upload Files</h1>
            <Dropzone className='p-16 mt-10 border border-neutral-200'/>
        </div>
    </section>
  )
}

export default Homepage
