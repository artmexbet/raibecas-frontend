import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import {DocumentListPage} from "@/pages/DocumentListPage.tsx";
import {LoginPage} from "@/pages/LoginPage.tsx";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/DocumentListPage">
                <DocumentListPage/>
            </ComponentPreview>
            <ComponentPreview path="/LoginPage">
                <LoginPage/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews