import Dropzone from '@/client/components/Dropzone'

const Homepage = () => {
    return (
        <section className='section flex flex-col items-center justify-center min-h-screen'>
            <h1 className='title text-3xl font-bold text-center'
                style={{
                    backgroundColor: 'rgba(0,255,208,255)',
                    color: 'black',
                    display: 'inline',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem'
                }}>Real estate image prediction and filtering</h1>
            <div className='container mt-10'>
                <div className='w-full max-w-md'>
                    <h2 className='title text-2xl font-semibold'
                        style={{
                            backgroundColor: 'rgba(0,255,208,255)',
                            color: 'black',
                            display: 'inline',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem'
                        }}>Upload File(s)</h2>
                    {/*<hr style={{ borderColor: 'rgba(0,255,208,255)', borderWidth: '1px', width: 'fit-content', marginTop: '0.5rem' }} />*/}
                </div>
                <Dropzone className='p-16 mt-10 border border-neutral-200'/>
            </div>
        </section>
    )
}

export default Homepage
