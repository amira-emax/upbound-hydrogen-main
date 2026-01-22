import { TextBlockFragment } from 'types/storefrontapi.generated';


interface TextBlockProps {
    reference: TextBlockFragment;
}

function TextBlock({ reference }: TextBlockProps) {

    const {
        label,
        description,
        header,
        listing,
        footer
    } = reference ?? {};

    const listItems: string[] = listing?.value ? JSON.parse(listing.value) : [];



    return (
        <div className="mb-8">
            {label?.value &&
                <p className="text-sm font-medium">{label?.value}</p>}


            {header?.value &&
                <div className='py-5'>
                    <h2 className="text-2xl font-bold mt-2" dangerouslySetInnerHTML={{ __html: header?.value }} />
                </div>
            }

            {description?.value &&
                <p className="mt-2 text-xl" dangerouslySetInnerHTML={{ __html: description?.value }} />}

            {listItems.length > 0 && (
                <ul className="mt-4  pl-5 space-y-1">
                    {listItems.map((item, i) => (
                        <li key={i}><span className='text-2xl'>{item}</span></li>
                    ))}
                </ul>
            )}


            {footer?.value &&
                <div className='py-10'>
                    <h2 className="text-2xl font-bold mt-2" dangerouslySetInnerHTML={{ __html: footer?.value }} />
                </div>
            }





        </div>
    );
}

export default TextBlock;
