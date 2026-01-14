import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import {DocumentListPage} from "@/pages/DocumentListPage.tsx";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/DocumentListPage">
                <DocumentListPage/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews