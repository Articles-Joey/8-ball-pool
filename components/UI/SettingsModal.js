import { useState } from "react";

import { Modal, Form } from "react-bootstrap"

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function FourFrogsSettingsModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    const [tab, setTab] = useState('Visuals')

    const darkMode = useEightBallStore((state) => state.darkMode)
    const toggleDarkMode = useEightBallStore((state) => state.toggleDarkMode)

    const graphicsQuality = useEightBallStore((state) => state.graphicsQuality)
    const setGraphicsQuality = useEightBallStore((state) => state.setGraphicsQuality)

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal"
                size='md'
                show={showModal}
                // To much jumping with little content for now
                // centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className='p-2'>
                        {[
                            'Visuals',
                            'Controls',
                            'Audio',
                            'Chat'
                        ].map(item =>
                            <ArticlesButton
                                key={item}
                                active={tab == item}
                                onClick={() => { setTab(item) }}
                            >
                                {item}
                            </ArticlesButton>
                        )}
                    </div>

                    <hr className="my-0" />

                    <div className="p-2">

                        {tab == 'Visuals' &&
                            <>
                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <Form.Check
                                            // ref={el => elementsRef.current[4] = el}
                                            type="switch"
                                            id="dark-mode-switch"
                                            label="Dark Mode"
                                            // value={enabled}
                                            checked={darkMode}
                                            onChange={() => {
                                                toggleDarkMode();
                                            }}
                                        />
                                    </div>
                                    <div className="small mt-2">
                                        {`Dark Mode changes the game's color scheme to be easier on the eyes in low light environments.`}
                                    </div>
                                </div>

                                <hr />

                                <div>
                                    <div className="mb-2">Quality</div>
                                    {[
                                        'Low',
                                        'Medium',
                                        'High',
                                    ].map((option, i) =>
                                        <ArticlesButton
                                            // ref={el => elementsRef.current[5 + i] = el}
                                            key={option}
                                            className=""
                                            active={graphicsQuality === option}
                                            onClick={() => setGraphicsQuality(option)}
                                        >
                                            {option}
                                        </ArticlesButton>
                                    )
                                    }
                                </div>

                            </>
                        }

                        {tab == 'Controls' &&
                            <div>
                                {[
                                    {
                                        action: 'Increase Power',
                                        defaultKeyboardKey: 'Arrow Up',
                                    },
                                    {
                                        action: 'Decrease Power',
                                        defaultKeyboardKey: 'Arrow Down',
                                    },
                                    {
                                        action: 'Rotate Left',
                                        defaultKeyboardKey: 'Arrow Left',
                                    },
                                    {
                                        action: 'Rotate Right',
                                        defaultKeyboardKey: 'Arrow Right',
                                    },
                                ].map(obj =>
                                    <div key={obj.action}>
                                        <div className="flex-header border-bottom pb-1 mb-1">

                                            <div>
                                                <div>{obj.action}</div>
                                                {obj.emote && <div className="span badge bg-dark">Emote</div>}
                                            </div>

                                            <div>

                                                <div className="badge badge-hover bg-articles me-1">{obj.defaultKeyboardKey}</div>

                                                <ArticlesButton 
                                                    className=""
                                                    small
                                                >
                                                    Change Key
                                                </ArticlesButton>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                        {tab == 'Audio' &&
                            <>
                                <Form.Label className="mb-0">Game Volume</Form.Label>
                                <Form.Range />
                                <Form.Label className="mb-0">Music Volume</Form.Label>
                                <Form.Range />
                            </>
                        }
                        {tab == 'Chat' &&
                            <>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat panel"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Censor chat"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat speech bubbles"
                                />
                            </>
                        }
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    {/* <div></div> */}


                    <div>

                        <ArticlesButton
                            variant="outline-dark"
                            onClick={() => {
                                setShow(false)
                            }}
                        >
                            Close
                        </ArticlesButton>

                        <ArticlesButton
                            variant="outline-danger ms-3"
                            onClick={() => {
                                setShow(false)
                            }}
                        >
                            Reset
                        </ArticlesButton>

                    </div>


                    {/* <ArticlesButton variant="success" onClick={() => setValue(false)}>
                    Save
                </ArticlesButton> */}

                </Modal.Footer>

            </Modal>
        </>
    )

}