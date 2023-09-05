import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { toast } from 'react-hot-toast';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { addToCart } from '../../../slices/cartSlice';
import { FaShareSquare } from 'react-icons/fa';

function CourseDetailsCard({course, setConfirmationModal, handleBuyCourse}) {

    const {user} = useSelector((state)=>state.profile);
    const {token} = useSelector((state)=>state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        thumbnail: ThumbnailImage,
        price: CurrentPrice,

    } = course;


    const handleAddToCart = () => {
        if(user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("You are an Instructor, you cant buy a course");
            return;
        }
        if(token) {
            
            dispatch(addToCart(course));
            return;
        }
        setConfirmationModal({
            text1:"you are not logged in",
            text2:"Please login to add to cart",
            btn1text:"login",
            btn2Text:"cancel",
            btn1Handler:()=>navigate("/login"),
            btn2Handler: ()=> setConfirmationModal(null),
        })
    }

    const handleShare = () => {
        copy(window.location.href);
        toast.success("Link Copied to Clipboard")
    }

    return (
        <div className='bg-richblack-700 rounded-[6px] w-[384px] h-[669px]  '>
            <img 
                src={ThumbnailImage}
                alt='Thumbnail Image'
                className='max-h-[300px] min-h-[180px] w-full '
            />

            <div className='px-2 font-semibold mt-2 text-lg text-white '>
                Rs. {CurrentPrice}
            </div>
            <div className='flex flex-col gap-y-6 px-2'>
                <button
                 className='bg-yellow-50 w-full text-richblack-900 px-2 py-2 font-semibold rounded-[6px] mt-2 mb-2'
                    onClick={
                        user && course?.studentsEnrolled.includes(user?._id)
                        ? ()=> navigate("/dashboard/enrolled-courses")
                        : handleBuyCourse
                    }
                >
                    {
                        user && course?.studentsEnrolled.includes(user?._id) ? "Go to Course ": "Buy Now"
                    }
                </button>

                {
                    (!course?.studentsEnrolled.includes(user?._id)) && (
                        <button onClick={handleAddToCart}  
                        className="blackButton">
                            Add to Cart
                        </button>
                    )
                }
            </div>

            <div className='flex flex-col gap-1 px-2 py-4'>
                <p className='text-richblack-200'>
                    30-Day Money-Back Guarantee
                </p>
                <p className='text-richblack-200'>
                    This Course Includes:
                </p>
                <div className='flex flex-col gap-y-3 text-caribbeangreen-300'>
                    {
                        course?.instructions?.map((item, index)=> (
                            <p key={index} className='flex gap-2'>
                                <span>{item}</span>
                            </p>
                        ))
                    }
                </div>
            </div>
            <div>
                <button
                className='mx-auto flex items-center gap-2 p-6 text-yellow-50'
                onClick={handleShare}
                >
                    Share
                    <FaShareSquare/>
                </button>
            </div>
        </div>
    );

}

export default CourseDetailsCard